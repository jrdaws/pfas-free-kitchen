// Regenerate WebP images with Orange/Stone palette
// Reference: COLOR_PHILOSOPHY.md v2.0
// Primary: Orange #F97316 | Background: Stone #1C1917

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API_KEY = process.env.STABILITY_API_KEY
if (!API_KEY) {
  console.error('Error: STABILITY_API_KEY environment variable required')
  process.exit(1)
}

const ASSETS = [
  {
    id: 'hero-gradient-bg',
    filename: 'hero-gradient-bg.webp',
    outputDir: 'output/shared/media/approved/framework-ui-redesign',
    width: 1920,
    height: 1080,
    generateWidth: 1344,
    generateHeight: 768,
    prompt: `Abstract flowing gradient background, warm stone tones, dark charcoal to warm gray,
subtle orange and amber glow orbs, soft flowing waves, smooth organic shapes,
dark mode friendly, 4K resolution, cinematic lighting, premium website hero background`,
    negativePrompt: 'purple, violet, lavender, indigo, blue, pink, magenta, neon, oversaturated, text, watermark'
  },
  {
    id: 'hero-gradient-bg-mobile',
    filename: 'hero-gradient-bg-mobile.webp',
    outputDir: 'output/shared/media/approved/framework-ui-redesign',
    width: 750,
    height: 1334,
    generateWidth: 768,
    generateHeight: 1344,
    prompt: `Abstract flowing gradient background, portrait orientation, warm stone tones,
dark charcoal transitioning to warm gray, subtle orange and amber accent glow,
soft flowing organic curves, dark mode optimized, mobile hero background, premium aesthetic`,
    negativePrompt: 'purple, violet, lavender, indigo, blue, pink, magenta, neon, oversaturated, text, watermark'
  },
  {
    id: 'hero-abstract-graphic',
    filename: 'hero-abstract-graphic.webp',
    outputDir: 'output/shared/media/approved/framework-ui-redesign',
    width: 1200,
    height: 800,
    generateWidth: 1344,
    generateHeight: 768,
    prompt: `Abstract geometric fractured glass design, sharp angular shapes, 
emerald teal primary color, orange and amber accent shards,
white and light gray transparent overlays, modern tech aesthetic,
depth and layering, dark corners, bright center focal point, premium 3D render`,
    negativePrompt: 'purple, violet, lavender, indigo, pink, magenta, text, watermark, person, face'
  },
  {
    id: 'terminal-mockup-clean',
    filename: 'terminal-mockup-clean.webp',
    outputDir: 'output/shared/media/approved/framework-ui-redesign',
    width: 1200,
    height: 800,
    generateWidth: 1344,
    generateHeight: 768,
    prompt: `macOS Terminal.app window screenshot, dark theme terminal, stone gray background #1C1917,
monospace font with green and orange colored text output, realistic terminal showing
npm install and git commands, window chrome with red yellow green traffic light buttons,
professional developer workstation aesthetic, clean minimal, no dashboard, command line only`,
    negativePrompt: 'dashboard, kanban, cards, tiles, project management, purple, violet, pink, GUI, buttons, sidebar, analytics, charts'
  },
  {
    id: 'export-success-graphic',
    filename: 'export-success-graphic.webp',
    outputDir: 'output/shared/media/approved/configurator-ux-redesign',
    width: 800,
    height: 600,
    generateWidth: 1024,
    generateHeight: 1024,
    prompt: `Stylized rocket launching illustration, flat design style,
emerald teal rocket body, orange and amber flame exhaust,
dark stone gray mountains silhouette, warm sunset sky gradient
from charcoal to amber, celebratory success moment,
modern minimal illustration style, vector art aesthetic`,
    negativePrompt: 'purple, violet, lavender, pink, magenta, blue mountains, blue sky, realistic, photograph'
  }
]

async function generateImage(asset) {
  console.log(`\n🎨 Generating: ${asset.id}`)
  console.log(`   Prompt: ${asset.prompt.substring(0, 80)}...`)
  
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      text_prompts: [
        { text: asset.prompt, weight: 1 },
        { text: asset.negativePrompt, weight: -1 }
      ],
      cfg_scale: 7,
      width: asset.generateWidth,
      height: asset.generateHeight,
      samples: 1,
      steps: 30
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error: ${error}`)
  }
  
  const data = await response.json()
  return Buffer.from(data.artifacts[0].base64, 'base64')
}

async function optimizeImage(inputBuffer, asset) {
  const tempPng = path.join(__dirname, `temp-${asset.id}.png`)
  const outputWebp = path.join(process.cwd(), asset.outputDir, asset.filename)
  
  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputWebp), { recursive: true })
  
  // Write temp PNG
  fs.writeFileSync(tempPng, inputBuffer)
  
  // Resize and convert to WebP using ImageMagick
  const { execSync } = await import('child_process')
  try {
    execSync(`magick "${tempPng}" -resize ${asset.width}x${asset.height} -quality 85 "${outputWebp}"`)
    console.log(`   ✅ Saved: ${outputWebp}`)
    
    // Get file size
    const stats = fs.statSync(outputWebp)
    console.log(`   📦 Size: ${(stats.size / 1024).toFixed(1)} KB`)
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng)
  }
  
  return outputWebp
}

async function main() {
  console.log('=== Regenerating WebP Images with Orange/Stone Palette ===')
  console.log(`   Primary: Orange #F97316`)
  console.log(`   Background: Stone #1C1917`)
  console.log('')
  
  const results = []
  
  for (const asset of ASSETS) {
    try {
      const imageBuffer = await generateImage(asset)
      const outputPath = await optimizeImage(imageBuffer, asset)
      results.push({ id: asset.id, status: 'success', path: outputPath })
    } catch (error) {
      console.error(`   ❌ Failed: ${asset.id}`)
      console.error(`   Error: ${error.message}`)
      results.push({ id: asset.id, status: 'failed', error: error.message })
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n=== Generation Complete ===')
  console.log('Results:')
  for (const r of results) {
    console.log(`  ${r.status === 'success' ? '✅' : '❌'} ${r.id}`)
  }
  
  const succeeded = results.filter(r => r.status === 'success').length
  console.log(`\nTotal: ${succeeded}/${ASSETS.length} succeeded`)
}

main().catch(console.error)

