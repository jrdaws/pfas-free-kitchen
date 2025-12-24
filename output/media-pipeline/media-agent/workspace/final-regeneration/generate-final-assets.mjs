#!/usr/bin/env node
/**
 * Final Regeneration Script - Iteration 3
 * 
 * Regenerates two problematic assets with improved prompts:
 * 1. hero-workspace-mobile.webp - Pristine MacBook Pro (no keyboard damage)
 * 2. terminal-mockup-clean.webp - macOS Terminal.app (not dashboard)
 */

import 'dotenv/config'

const API_KEY = process.env.STABILITY_API_KEY || 'sk-e1neYMXGY7VLyWTXB9RcQj6rtgLLKiBlL5b4KwiBWzf6pMc7'
const API_HOST = 'https://api.stability.ai'

import fs from 'fs/promises'
import path from 'path'

const rawDir = './raw'
const optimizedDir = './optimized'

await fs.mkdir(rawDir, { recursive: true })
await fs.mkdir(optimizedDir, { recursive: true })

// Asset 1: Hero Workspace Mobile - Pristine MacBook Pro
const heroWorkspaceMobilePrompt = `Close-up overhead view of brand new pristine silver MacBook Pro laptop computer with perfect immaculate keyboard and flawless black keys arranged in neat rows, every key perfectly formed and undamaged, on minimal white marble desk surface, laptop lid open at 45 degree angle showing soft glowing screen with indigo gradient, morning natural window light from side creating soft shadows, shot on Canon EOS R5 with 50mm f/1.4 lens, shallow depth of field, clean minimal aesthetic, Apple advertising quality, premium tech lifestyle photography, factory fresh condition`

const heroWorkspaceMobileNegative = `damaged keyboard, broken keys, melted keys, burnt keyboard, warped keys, deformed keys, missing keys, fire damage, heat damage, destroyed laptop, broken laptop, scratched, worn, old, dirty, dusty, cracked, charred, holes, defects, artifacts, distorted, malformed`

// Asset 2: Terminal Mockup - macOS Terminal.app UI
const terminalMockupPrompt = `Flat design UI mockup of a macOS Terminal dot app window, dark gray window background color 1E1E1E hex, top left corner shows three small circular dots in red yellow green as traffic light buttons, white title bar at top with word Terminal, inside the window shows green monospace text on pure black background displaying command line interface text, shows typed commands npm install and npx framework export with cursor blinking, window has subtle rounded corners, floating on soft indigo to violet gradient background, Figma style UI design mockup, Dribbble trending design, clean vector aesthetic, 2D flat interface design, no perspective, no 3D effects`

const terminalMockupNegative = `photograph, camera, hardware, physical device, laptop, computer, desk, monitor, screen, Kanban board, cards, dashboard, project management, colorful buttons, rainbow colors, LED lights, industrial, real world, physical, tangible, depth, shadows, 3D render, perspective view`

const assetsToGenerate = [
  {
    id: 'hero-workspace-mobile-v3',
    prompt: heroWorkspaceMobilePrompt,
    negativePrompt: heroWorkspaceMobileNegative,
    width: 768,  // SDXL compatible (portrait)
    height: 1344,
    style_preset: 'photographic',
    cfg_scale: 6.5, // Lower CFG as suggested
    targetWidth: 750,
    targetHeight: 1000,
    outputProject: 'e2e-test-project',
    finalName: 'hero-workspace-mobile.webp',
  },
  {
    id: 'terminal-mockup-clean-v3',
    prompt: terminalMockupPrompt,
    negativePrompt: terminalMockupNegative,
    width: 1344,  // SDXL compatible
    height: 768,
    style_preset: 'digital-art',
    cfg_scale: 5.5, // Lower CFG to reduce "creative interpretation"
    targetWidth: 1200,
    targetHeight: 800,
    outputProject: 'framework-ui-redesign',
    finalName: 'terminal-mockup-clean.webp',
  },
]

async function generateImage(asset) {
  console.log(`\n🎨 Generating: ${asset.id}`)
  console.log(`   Style: ${asset.style_preset}`)
  console.log(`   CFG Scale: ${asset.cfg_scale}`)
  console.log(`   Dimensions: ${asset.width}x${asset.height} → ${asset.targetWidth}x${asset.targetHeight}`)

  const body = {
    text_prompts: [
      { text: asset.prompt, weight: 1 },
      { text: asset.negativePrompt, weight: -1 },
    ],
    cfg_scale: asset.cfg_scale,
    width: asset.width,
    height: asset.height,
    samples: 1,
    steps: 40,
    style_preset: asset.style_preset,
  }

  const response = await fetch(
    `${API_HOST}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`API Error: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  const image = data.artifacts[0]
  
  const outputPath = path.join(rawDir, `${asset.id}.png`)
  await fs.writeFile(outputPath, Buffer.from(image.base64, 'base64'))
  console.log(`   ✅ Saved: ${outputPath}`)
  
  return outputPath
}

async function optimizeImage(inputPath, asset) {
  const { execa } = await import('execa')
  
  const outputPath = path.join(optimizedDir, `${asset.id}.webp`)
  
  await execa('magick', [
    inputPath,
    '-resize', `${asset.targetWidth}x${asset.targetHeight}!`,
    '-quality', '85',
    outputPath,
  ])
  
  const stats = await fs.stat(outputPath)
  console.log(`   ✅ Optimized: ${outputPath} (${(stats.size / 1024).toFixed(1)}KB)`)
  
  return { outputPath, size: stats.size }
}

async function copyToProject(optimizedPath, asset) {
  const projectDir = `../../../shared/assets/${asset.outputProject}/optimized`
  await fs.mkdir(projectDir, { recursive: true })
  
  const finalPath = path.join(projectDir, asset.finalName)
  await fs.copyFile(optimizedPath, finalPath)
  console.log(`   ✅ Copied to project: ${finalPath}`)
}

console.log('=' .repeat(60))
console.log('🔄 FINAL REGENERATION - Iteration 3')
console.log('=' .repeat(60))

const results = []

for (const asset of assetsToGenerate) {
  try {
    const rawPath = await generateImage(asset)
    const { outputPath, size } = await optimizeImage(rawPath, asset)
    await copyToProject(outputPath, asset)
    
    results.push({
      id: asset.id,
      status: 'success',
      size,
      project: asset.outputProject,
      finalName: asset.finalName,
    })
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    results.push({
      id: asset.id,
      status: 'failed',
      error: error.message,
    })
  }
}

console.log('\n' + '=' .repeat(60))
console.log('📊 RESULTS')
console.log('=' .repeat(60))
results.forEach(r => {
  if (r.status === 'success') {
    console.log(`✅ ${r.id} → ${r.project}/${r.finalName} (${(r.size/1024).toFixed(1)}KB)`)
  } else {
    console.log(`❌ ${r.id} - ${r.error}`)
  }
})

// Create summary
const summary = {
  iteration: 3,
  generatedAt: new Date().toISOString(),
  results,
  prompts: {
    heroWorkspaceMobile: {
      prompt: heroWorkspaceMobilePrompt,
      negative: heroWorkspaceMobileNegative,
      cfgScale: 6.5,
    },
    terminalMockup: {
      prompt: terminalMockupPrompt,
      negative: terminalMockupNegative,
      cfgScale: 5.5,
    },
  },
}

await fs.writeFile('./generation-summary.json', JSON.stringify(summary, null, 2))
console.log('\n📄 Summary saved to generation-summary.json')

