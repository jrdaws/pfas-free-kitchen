/**
 * Slot Assembler
 * 
 * Loads and assembles component slot templates for the page builder.
 * Renders templates with variables and AI-generated content.
 * Uses simple mustache-style placeholders (no external dependencies).
 */

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SLOTS_DIR = path.join(__dirname, '..', '..', 'templates', 'slots')

/**
 * Load the slot manifest
 * @returns {Promise<object>} Slot manifest configuration
 */
export async function loadSlotManifest() {
  const manifestPath = path.join(SLOTS_DIR, 'manifest.json')
  
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Slot manifest not found. Run template setup first.')
  }
  
  return fs.readJSON(manifestPath)
}

/**
 * Get slot definition by ID
 * @param {string} slotId - The slot ID
 * @returns {Promise<object|null>} Slot definition or null
 */
export async function getSlot(slotId) {
  const manifest = await loadSlotManifest()
  return manifest.slots.find(s => s.id === slotId) || null
}

/**
 * Get all slots by category
 * @param {string} category - The category name
 * @returns {Promise<object[]>} Array of slot definitions
 */
export async function getSlotsByCategory(category) {
  const manifest = await loadSlotManifest()
  return manifest.slots.filter(s => s.category === category)
}

/**
 * Get all slot categories
 * @returns {Promise<object>} Category definitions
 */
export async function getSlotCategories() {
  const manifest = await loadSlotManifest()
  return manifest.categories
}

/**
 * Load AI prompt template for a slot category
 * @param {string} category - The category name
 * @returns {Promise<string>} Prompt template content
 */
export async function loadPromptTemplate(category) {
  const manifest = await loadSlotManifest()
  const promptPath = manifest.promptTemplates?.[category]
  
  if (!promptPath) {
    return null
  }
  
  const fullPath = path.join(SLOTS_DIR, promptPath)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  return fs.readFile(fullPath, 'utf8')
}

/**
 * Render prompt template with context
 * @param {string} category - The slot category
 * @param {object} context - Template variables
 * @returns {Promise<string>} Rendered prompt
 */
export async function renderPrompt(category, context) {
  const template = await loadPromptTemplate(category)
  
  if (!template) {
    throw new Error(`No prompt template found for category: ${category}`)
  }
  
  // Use simple mustache-style replacement for prompt templates
  let rendered = template
  for (const [key, value] of Object.entries(context)) {
    rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '')
  }
  
  return rendered
}

/**
 * Load a slot template
 * @param {string} templatePath - Path relative to slots directory
 * @returns {Promise<string>} Template content
 */
async function loadTemplate(templatePath) {
  const fullPath = path.join(SLOTS_DIR, templatePath)
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Template not found: ${templatePath}`)
  }
  
  return fs.readFile(fullPath, 'utf8')
}

/**
 * Simple mustache-style template rendering
 * Replaces {{variable}} with values
 * @param {string} template - Template string
 * @param {object} variables - Variable values
 * @returns {string} Rendered template
 */
function renderTemplate(template, variables) {
  let result = template
  
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      // Handle simple variable replacement
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
      
      // Handle #if blocks (simplified)
      const ifRegex = new RegExp(`\\{\\{#if ${key}\\}\\}([\\s\\S]*?)\\{\\{/if\\}\\}`, 'g')
      result = result.replace(ifRegex, value ? '$1' : '')
      
      // Handle #each for arrays
      if (Array.isArray(value)) {
        const eachRegex = new RegExp(`\\{\\{#each ${key}\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}`, 'g')
        result = result.replace(eachRegex, (match, itemTemplate) => {
          return value.map((item, index) => {
            let itemResult = itemTemplate
            if (typeof item === 'object') {
              for (const [itemKey, itemValue] of Object.entries(item)) {
                itemResult = itemResult.replace(new RegExp(`\\{\\{this\\.${itemKey}\\}\\}`, 'g'), String(itemValue || ''))
              }
            }
            itemResult = itemResult.replace(/\{\{@last\}\}/g, String(index === value.length - 1))
            itemResult = itemResult.replace(/\{\{@index\}\}/g, String(index))
            return itemResult
          }).join('')
        })
      }
    }
  }
  
  // Clean up any remaining unmatched conditionals
  result = result.replace(/\{\{#if [^}]+\}\}[\s\S]*?\{\{\/if\}\}/g, '')
  result = result.replace(/\{\{#unless @last\}\}[^{]*\{\{\/unless\}\}/g, '')
  
  return result
}

/**
 * Assemble a slot with variables
 * @param {string} slotId - The slot ID
 * @param {object} variables - Variable values
 * @param {object} options - Assembly options
 * @returns {Promise<object>} Assembled slot result
 */
export async function assembleSlot(slotId, variables = {}, options = {}) {
  const { projectName = 'my-project', generateAI = false } = options
  
  const slot = await getSlot(slotId)
  
  if (!slot) {
    throw new Error(`Unknown slot: ${slotId}`)
  }
  
  // Merge defaults with provided variables
  const mergedVariables = { projectName }
  
  for (const varDef of slot.variables || []) {
    if (variables[varDef.name] !== undefined) {
      mergedVariables[varDef.name] = variables[varDef.name]
    } else if (varDef.default !== undefined) {
      mergedVariables[varDef.name] = varDef.default
    }
  }
  
  // Get variables that need AI generation
  const aiVariables = (slot.variables || [])
    .filter(v => v.aiGenerate && !variables[v.name])
    .map(v => v.name)
  
  // Load and render template
  const templateContent = await loadTemplate(slot.template)
  const renderedContent = renderTemplate(templateContent, mergedVariables)
  
  return {
    slotId,
    slotName: slot.name,
    category: slot.category,
    content: renderedContent,
    variables: mergedVariables,
    aiVariablesNeeded: aiVariables,
    source: slot.source,
  }
}

/**
 * Get slot summary for display
 * @returns {Promise<object>} Summary of available slots
 */
export async function getSlotSummary() {
  const manifest = await loadSlotManifest()
  
  const byCategory = {}
  for (const slot of manifest.slots) {
    if (!byCategory[slot.category]) {
      byCategory[slot.category] = []
    }
    byCategory[slot.category].push({
      id: slot.id,
      name: slot.name,
      description: slot.description,
    })
  }
  
  return {
    totalSlots: manifest.slots.length,
    categories: Object.keys(manifest.categories),
    byCategory,
  }
}

/**
 * Validate slot variables
 * @param {string} slotId - The slot ID
 * @param {object} variables - Variable values
 * @returns {Promise<object>} Validation result
 */
export async function validateSlotVariables(slotId, variables) {
  const slot = await getSlot(slotId)
  
  if (!slot) {
    return { valid: false, errors: [`Unknown slot: ${slotId}`] }
  }
  
  const errors = []
  const warnings = []
  
  for (const varDef of slot.variables || []) {
    if (varDef.required && !variables[varDef.name] && !varDef.default) {
      if (varDef.aiGenerate) {
        warnings.push(`Variable "${varDef.name}" is required but can be AI-generated`)
      } else {
        errors.push(`Required variable missing: ${varDef.name}`)
      }
    }
    
    // Type validation
    if (variables[varDef.name] !== undefined) {
      const value = variables[varDef.name]
      
      if (varDef.type === 'array' && !Array.isArray(value)) {
        errors.push(`Variable "${varDef.name}" must be an array`)
      }
      
      if (varDef.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Variable "${varDef.name}" must be a boolean`)
      }
      
      if (varDef.type === 'number' && typeof value !== 'number') {
        errors.push(`Variable "${varDef.name}" must be a number`)
      }
      
      if (varDef.type === 'enum' && varDef.options && !varDef.options.includes(value)) {
        errors.push(`Variable "${varDef.name}" must be one of: ${varDef.options.join(', ')}`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get all slots formatted for a dropdown/picker
 * @returns {Promise<object[]>} Array of slot options
 */
export async function getSlotOptions() {
  const manifest = await loadSlotManifest()
  
  return manifest.slots.map(slot => ({
    value: slot.id,
    label: slot.name,
    category: slot.category,
    description: slot.description,
    supports: slot.supports,
    source: slot.source,
  }))
}

/**
 * Get the prompt template path for a slot
 * @param {string} slotId - The slot ID
 * @returns {Promise<string|null>} Prompt template path or null
 */
export async function getSlotPromptPath(slotId) {
  const slot = await getSlot(slotId)
  if (!slot) return null
  
  const manifest = await loadSlotManifest()
  return manifest.promptTemplates?.[slot.category] || null
}

