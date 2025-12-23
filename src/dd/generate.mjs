/**
 * Generate Command Logic
 * 
 * Wraps the @dawson-framework/ai-agent package to provide
 * project generation via the CLI.
 */

import fs from 'node:fs'
import path from 'node:path'
import prompts from 'prompts'
import * as logger from './logger.mjs'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

/**
 * Parse generate command flags
 * @param {string[]} args - Command arguments
 * @returns {object} Parsed flags
 */
export function parseGenerateFlags(args) {
  const flags = {
    description: null,
    name: null,
    template: null,
    tier: 'balanced',
    output: './',
    stream: true,
    vision: null,
    mission: null,
  }

  const hasValue = (idx) => args[idx + 1] && !args[idx + 1].startsWith('--') && !args[idx + 1].startsWith('-')

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if ((arg === '--description' || arg === '-d') && hasValue(i)) {
      flags.description = args[++i]
    } else if ((arg === '--name' || arg === '-n') && hasValue(i)) {
      flags.name = args[++i]
    } else if ((arg === '--template' || arg === '-t') && hasValue(i)) {
      flags.template = args[++i]
    } else if (arg === '--tier' && hasValue(i)) {
      const tier = args[++i]
      if (['fast', 'balanced', 'quality'].includes(tier)) {
        flags.tier = tier
      }
    } else if ((arg === '--output' || arg === '-o') && hasValue(i)) {
      flags.output = args[++i]
    } else if (arg === '--no-stream') {
      flags.stream = false
    } else if (arg === '--vision' && hasValue(i)) {
      flags.vision = args[++i]
    } else if (arg === '--mission' && hasValue(i)) {
      flags.mission = args[++i]
    }
  }

  return flags
}

/**
 * Interactive prompt for project details
 * @param {object} flags - Existing flags (may be partially filled)
 * @returns {Promise<object>} Complete project input
 */
export async function promptForInput(flags) {
  const questions = []

  if (!flags.description) {
    questions.push({
      type: 'text',
      name: 'description',
      message: 'Describe your project:',
      validate: (v) => v.length > 10 || 'Please provide a more detailed description (at least 10 characters)',
    })
  }

  if (!flags.name) {
    questions.push({
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: 'my-project',
    })
  }

  if (!flags.template) {
    questions.push({
      type: 'select',
      name: 'template',
      message: 'Choose a template:',
      choices: [
        { title: 'SaaS (recommended)', value: 'saas' },
        { title: 'Flagship SaaS', value: 'flagship-saas' },
        { title: 'SEO Directory', value: 'seo-directory' },
        { title: 'Dashboard', value: 'dashboard' },
        { title: 'Blog', value: 'blog' },
        { title: 'Landing Page', value: 'landing-page' },
      ],
      initial: 0,
    })
  }

  if (questions.length === 0) {
    return flags
  }

  console.log('')
  const answers = await prompts(questions, {
    onCancel: () => {
      console.log('\n❌ Generation cancelled.')
      process.exit(1)
    },
  })

  return {
    ...flags,
    ...answers,
  }
}

/**
 * Display a simple spinner
 * @param {string} message - Spinner message
 * @returns {object} Spinner control object
 */
function createSpinner(message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let frameIndex = 0
  let intervalId = null

  return {
    start() {
      process.stdout.write(`\r${colors.cyan}${frames[0]}${colors.reset} ${message}`)
      intervalId = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length
        process.stdout.write(`\r${colors.cyan}${frames[frameIndex]}${colors.reset} ${message}`)
      }, 80)
    },
    update(newMessage) {
      message = newMessage
    },
    succeed(finalMessage) {
      if (intervalId) clearInterval(intervalId)
      process.stdout.write(`\r${colors.green}✓${colors.reset} ${finalMessage || message}\n`)
    },
    fail(finalMessage) {
      if (intervalId) clearInterval(intervalId)
      process.stdout.write(`\r${colors.yellow}✗${colors.reset} ${finalMessage || message}\n`)
    },
  }
}

/**
 * Format token usage summary
 * @param {object} summary - Token summary from tracker
 * @returns {string} Formatted summary
 */
function formatTokenSummary(summary) {
  if (!summary) return ''

  const lines = [
    '',
    `${colors.bold}📊 Token Usage Summary${colors.reset}`,
    `   Total: ${summary.totalTokens?.toLocaleString() || 'N/A'} tokens`,
  ]

  if (summary.byStage) {
    for (const [stage, usage] of Object.entries(summary.byStage)) {
      lines.push(`   ${stage}: ${usage.input || 0} in / ${usage.output || 0} out`)
    }
  }

  if (summary.estimatedCost) {
    lines.push(`   Estimated cost: $${summary.estimatedCost.toFixed(4)}`)
  }

  return lines.join('\n')
}

/**
 * Write generated files to disk
 * @param {object} result - Generation result
 * @param {string} outputDir - Output directory
 * @param {string} projectName - Project name
 */
async function writeGeneratedFiles(result, outputDir, projectName) {
  const projectDir = path.join(outputDir, projectName)

  // Create project directory
  fs.mkdirSync(projectDir, { recursive: true })

  // Write generated code files
  if (result.code?.files) {
    for (const file of result.code.files) {
      const filePath = path.join(projectDir, file.path)
      const dir = path.dirname(filePath)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, file.content, 'utf8')
    }
  }

  // Write integration code files
  if (result.code?.integrationCode) {
    for (const integration of result.code.integrationCode) {
      for (const file of integration.files) {
        const filePath = path.join(projectDir, file.path)
        const dir = path.dirname(filePath)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filePath, file.content, 'utf8')
      }
    }
  }

  // Write Cursor context files
  if (result.context) {
    if (result.context.cursorrules) {
      fs.writeFileSync(path.join(projectDir, '.cursorrules'), result.context.cursorrules, 'utf8')
    }
    if (result.context.startPrompt) {
      fs.writeFileSync(path.join(projectDir, 'START_PROMPT.md'), result.context.startPrompt, 'utf8')
    }
  }

  // Write .dd metadata
  const ddDir = path.join(projectDir, '.dd')
  fs.mkdirSync(ddDir, { recursive: true })

  // Write intent analysis
  if (result.intent) {
    fs.writeFileSync(
      path.join(ddDir, 'intent.json'),
      JSON.stringify(result.intent, null, 2),
      'utf8'
    )
  }

  // Write architecture
  if (result.architecture) {
    fs.writeFileSync(
      path.join(ddDir, 'architecture.json'),
      JSON.stringify(result.architecture, null, 2),
      'utf8'
    )
  }

  // Write generation metadata
  fs.writeFileSync(
    path.join(ddDir, 'generation.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      template: result.architecture?.template || 'saas',
      category: result.intent?.category,
      complexity: result.intent?.complexity,
      features: result.intent?.features,
    }, null, 2),
    'utf8'
  )

  return projectDir
}

/**
 * Main generate command handler
 * @param {string[]} args - Command arguments
 */
export async function cmdGenerate(args) {
  // Handle help flag
  const firstArg = args[0]
  if (firstArg === '--help' || firstArg === '-h' || firstArg === 'help') {
    console.log(`Usage: framework generate [options]

Generate a new project using AI based on your description.

Options:
  -d, --description <text>   Project description (required)
  -n, --name <name>          Project name (default: my-project)
  -t, --template <template>  Template to use (saas, flagship-saas, seo-directory, etc.)
  --tier <tier>              Model tier: fast, balanced, quality (default: balanced)
  -o, --output <dir>         Output directory (default: ./)
  --no-stream                Disable streaming progress
  --vision <text>            Project vision statement
  --mission <text>           Project mission statement

Model Tiers:
  fast       Uses Haiku for all stages (~$0.01/project, fastest)
  balanced   Uses Haiku + Sonnet mix (~$0.05/project, default)
  quality    Uses Sonnet for all stages (~$0.20/project, best)

Examples:
  framework generate -d "A fitness tracking app with workout plans" -n fittrack
  framework generate -d "SaaS for managing invoices" --tier quality
  framework generate                                    # Interactive mode

Environment:
  ANTHROPIC_API_KEY   Required. Your Anthropic API key.
`)
    return
  }

  // Parse flags
  const flags = parseGenerateFlags(args)

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    logger.showError('ANTHROPIC_API_KEY environment variable is required', {
      reasons: [
        'The generate command uses Claude AI to create your project',
        'An Anthropic API key is required for authentication',
      ],
      solutions: [
        'Get an API key from https://console.anthropic.com/',
        'Set the environment variable: export ANTHROPIC_API_KEY=your-key',
        'Or add it to your .env file',
      ],
    })
    return
  }

  // Interactive mode if description not provided
  const input = await promptForInput(flags)

  console.log('')
  console.log(`${colors.bold}🤖 Dawson-Does AI Project Generator${colors.reset}`)
  console.log('')
  console.log(`   Project: ${colors.cyan}${input.name || 'my-project'}${colors.reset}`)
  console.log(`   Template: ${colors.cyan}${input.template || 'saas'}${colors.reset}`)
  console.log(`   Tier: ${colors.cyan}${input.tier}${colors.reset}`)
  console.log('')

  // Dynamic import of ai-agent package
  let aiAgent
  try {
    aiAgent = await import('@dawson-framework/ai-agent')
  } catch (importErr) {
    // Try relative import for development
    try {
      const pkgPath = new URL('../../packages/ai-agent/dist/index.js', import.meta.url).pathname
      aiAgent = await import(pkgPath)
    } catch (relativeErr) {
      logger.showError('Failed to load AI generation engine', {
        reasons: [
          'The @dawson-framework/ai-agent package is not installed',
          'Package build may be incomplete',
        ],
        solutions: [
          'Run: cd packages/ai-agent && npm run build',
          'Check that packages/ai-agent/dist/index.js exists',
        ],
      })
      return
    }
  }

  // Stage tracking for progress display
  const stages = {
    intent: { name: 'Analyzing intent', spinner: null, complete: false },
    architecture: { name: 'Designing architecture', spinner: null, complete: false },
    code: { name: 'Generating code', spinner: null, complete: false },
    context: { name: 'Building Cursor context', spinner: null, complete: false },
  }

  let currentSpinner = null

  // Progress callback for streaming
  const onProgress = (event) => {
    const stage = stages[event.stage]
    if (!stage) return

    if (event.type === 'start') {
      if (currentSpinner) {
        currentSpinner.succeed()
      }
      currentSpinner = createSpinner(stage.name + '...')
      currentSpinner.start()
    } else if (event.type === 'complete') {
      if (currentSpinner) {
        currentSpinner.succeed(stage.name + ' ✓')
        currentSpinner = null
      }
      stage.complete = true
    }
  }

  // Build project input
  const projectInput = {
    description: input.description,
    projectName: input.name || 'my-project',
    template: input.template,
    vision: input.vision,
    mission: input.mission,
  }

  // Generate project
  let result
  try {
    result = await aiAgent.generateProject(projectInput, {
      apiKey,
      modelTier: input.tier,
      stream: input.stream,
      onProgress: input.stream ? onProgress : undefined,
      logTokenUsage: false, // We'll handle this ourselves
    })
  } catch (genErr) {
    if (currentSpinner) {
      currentSpinner.fail('Generation failed')
    }
    logger.showError(`Generation failed: ${genErr.message}`, {
      reasons: [
        'API rate limit may have been exceeded',
        'Invalid API key',
        'Network connectivity issue',
      ],
      solutions: [
        'Check your ANTHROPIC_API_KEY is valid',
        'Wait a moment and try again',
        'Try using --tier fast for lower cost/faster generation',
      ],
    })
    return
  }

  // Write files to disk
  console.log('')
  const writeSpinner = createSpinner('Writing files to disk...')
  writeSpinner.start()

  let projectDir
  try {
    projectDir = await writeGeneratedFiles(
      result,
      input.output || './',
      input.name || 'my-project'
    )
    writeSpinner.succeed(`Files written to ${projectDir}`)
  } catch (writeErr) {
    writeSpinner.fail('Failed to write files')
    logger.showError(`Failed to write files: ${writeErr.message}`, {
      solutions: [
        'Check you have write permissions to the output directory',
        'Ensure there is enough disk space',
      ],
    })
    return
  }

  // Get token usage from tracker
  let tokenSummary = null
  try {
    const tracker = aiAgent.getGlobalTracker()
    if (tracker) {
      tokenSummary = tracker.getSummary()
    }
  } catch {
    // Token tracking not available
  }

  // Display success summary
  console.log('')
  console.log(`${colors.green}${colors.bold}✅ Project generated successfully!${colors.reset}`)
  console.log('')
  console.log(`   Directory: ${colors.cyan}${projectDir}${colors.reset}`)
  console.log(`   Template: ${colors.cyan}${result.architecture?.template || 'saas'}${colors.reset}`)
  console.log(`   Category: ${colors.cyan}${result.intent?.category || 'saas'}${colors.reset}`)
  console.log(`   Complexity: ${colors.cyan}${result.intent?.complexity || 'moderate'}${colors.reset}`)

  if (result.code?.files) {
    console.log(`   Files: ${colors.cyan}${result.code.files.length}${colors.reset}`)
  }

  if (result.intent?.features) {
    console.log(`   Features: ${colors.cyan}${result.intent.features.length}${colors.reset}`)
  }

  // Token usage
  if (tokenSummary) {
    console.log(formatTokenSummary(tokenSummary))
  }

  // Next steps
  console.log('')
  console.log(`${colors.bold}Next steps:${colors.reset}`)
  console.log(`   cd ${input.name || 'my-project'}`)
  console.log(`   npm install`)
  console.log(`   npm run dev`)
  console.log('')
  console.log(`${colors.dim}💡 Open the project in Cursor and review START_PROMPT.md${colors.reset}`)
}

