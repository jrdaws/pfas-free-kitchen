#!/usr/bin/env node

/**
 * Publish Verified Products to Sanity
 * 
 * Fetches products with status "Verified" from Airtable,
 * creates them in Sanity, and updates Airtable status to "Published".
 * 
 * Setup:
 * 1. Add to your .env file:
 *    SANITY_PROJECT_ID=your_project_id
 *    SANITY_DATASET=production
 *    SANITY_API_TOKEN=your_write_token
 * 
 * Usage:
 *   node scripts/publish-to-sanity.mjs           # Publish all verified products
 *   node scripts/publish-to-sanity.mjs --dry-run # Preview without making changes
 *   node scripts/publish-to-sanity.mjs rec123    # Publish specific record
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

// Airtable config
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Products'

// Sanity config
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID
const SANITY_DATASET = process.env.SANITY_DATASET || 'production'
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const SPECIFIC_RECORD = args.find(a => a.startsWith('rec'))

function checkConfig() {
  const missing = []
  if (!AIRTABLE_API_KEY) missing.push('AIRTABLE_API_KEY')
  if (!AIRTABLE_BASE_ID) missing.push('AIRTABLE_BASE_ID')
  if (!SANITY_PROJECT_ID) missing.push('SANITY_PROJECT_ID')
  if (!SANITY_API_TOKEN) missing.push('SANITY_API_TOKEN')
  
  if (missing.length > 0) {
    console.error(`\nMissing environment variables: ${missing.join(', ')}\n`)
    console.error(`Add them to your .env file:
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_TOKEN=sk...

Get Sanity token: https://www.sanity.io/manage → Project → API → Tokens → Add token (Editor permissions)
`)
    process.exit(1)
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractAsin(url) {
  if (!url) return null
  const match = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/)
  return match ? (match[1] || match[2]) : null
}

async function fetchVerifiedProducts() {
  let filterFormula = `OR({Status} = "Verified", {Status} = "New")`
  if (SPECIFIC_RECORD) {
    filterFormula = `RECORD_ID() = "${SPECIFIC_RECORD}"`
  }
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`
  const params = new URLSearchParams({ filterByFormula: filterFormula })

  const response = await fetch(`${url}?${params}`, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  })

  if (!response.ok) {
    throw new Error(`Airtable error: ${response.status} - ${await response.text()}`)
  }

  const data = await response.json()
  return data.records
}

async function updateAirtableStatus(recordId, status) {
  if (DRY_RUN) return { fields: { Status: status } }
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: { Status: status } })
  })

  if (!response.ok) {
    throw new Error(`Failed to update Airtable: ${await response.text()}`)
  }

  return await response.json()
}

async function sanityQuery(query, params = {}) {
  const url = new URL(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}`)
  url.searchParams.set('query', query)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value))
  }

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${SANITY_API_TOKEN}` }
  })

  const data = await response.json()
  return data.result
}

async function sanityMutate(mutations) {
  if (DRY_RUN) {
    console.log('  [DRY RUN] Would create:', JSON.stringify(mutations, null, 2).slice(0, 500) + '...')
    return { results: [{ id: 'dry-run-id' }] }
  }

  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}?returnIds=true`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SANITY_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mutations })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Sanity error: ${error}`)
  }

  return await response.json()
}

async function findOrCreateBrand(brandName) {
  if (!brandName) return null
  
  const existing = await sanityQuery(
    `*[_type == "brand" && name == $name][0]._id`,
    { name: brandName }
  )
  
  if (existing) return { _type: 'reference', _ref: existing }
  
  const slug = slugify(brandName)
  const result = await sanityMutate([{
    create: {
      _type: 'brand',
      name: brandName,
      slug: { _type: 'slug', current: slug }
    }
  }])
  
  console.log(`  Created brand: ${brandName}`)
  return { _type: 'reference', _ref: result.results[0].id ?? result.results[0].documentId }
}

async function findOrCreateCategory(categoryName) {
  if (!categoryName) return null

  const existing = await sanityQuery(
    `*[_type == "category" && (name == $name || slug.current == $slug)][0]._id`,
    { name: categoryName, slug: slugify(categoryName) }
  )

  if (existing) return { _type: 'reference', _ref: existing }

  const slug = slugify(categoryName)
  const result = await sanityMutate([{
    create: {
      _type: 'category',
      name: categoryName,
      slug: { _type: 'slug', current: slug }
    }
  }])

  console.log(`  Created category: ${categoryName}`)
  return { _type: 'reference', _ref: result.results[0].id ?? result.results[0].documentId }
}

function mapPfasScoreToTier(score) {
  if (!score) return 0
  if (score >= 9) return 3
  if (score >= 7) return 2
  if (score >= 5) return 1
  return 0
}

async function uploadImageToSanity(imageUrl, filename) {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would upload image: ${filename}`)
    return { _type: 'image', asset: { _type: 'reference', _ref: 'dry-run-image-id' } }
  }

  try {
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`)
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await imageResponse.arrayBuffer()

    const uploadUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${SANITY_DATASET}`
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SANITY_API_TOKEN}`,
        'Content-Type': contentType,
      },
      body: imageBuffer
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      throw new Error(`Sanity upload error: ${error}`)
    }

    const result = await uploadResponse.json()
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: result.document._id }
    }
  } catch (error) {
    console.log(`  ⚠️ Failed to upload image: ${error.message}`)
    return null
  }
}

async function processImages(productImages) {
  if (!productImages || !Array.isArray(productImages) || productImages.length === 0) {
    return []
  }

  console.log(`  📷 Processing ${productImages.length} image(s)...`)
  
  const uploadedImages = []
  for (let i = 0; i < productImages.length; i++) {
    const img = productImages[i]
    const url = img.url || img
    const filename = img.filename || `image-${i + 1}`
    
    const uploaded = await uploadImageToSanity(url, filename)
    if (uploaded) {
      uploaded.alt = filename
      uploaded.isPrimary = i === 0
      uploadedImages.push(uploaded)
      console.log(`  ✓ Uploaded: ${filename}`)
    }
  }

  return uploadedImages
}

async function createSanityProduct(airtableRecord) {
  const f = airtableRecord.fields
  const productName = f['Product Name']
  const slug = slugify(productName)
  
  const existing = await sanityQuery(
    `*[_type == "product" && slug.current == $slug][0]._id`,
    { slug }
  )
  
  if (existing) {
    console.log(`  Product "${productName}" already exists in Sanity, skipping`)
    return existing
  }

  const brandRef = await findOrCreateBrand(f['Brand'])
  const categoryRef = await findOrCreateCategory(f['Category'])
  
  const images = await processImages(f['Product Images'])
  
  const doc = {
    _type: 'product',
    name: productName,
    slug: { _type: 'slug', current: slug },
    brand: brandRef,
    category: categoryRef,
    images: images.length > 0 ? images : undefined,
    verificationTier: mapPfasScoreToTier(f['PFAS Score']),
    verificationRationale: f['Research Notes'] || f['VA Notes'] || undefined,
    materialSummary: f['Material Type'] || f['Material'] || undefined,
    coatingSummary: f['Coating'] || undefined,
    amazonAsin: extractAsin(f['Amazon URL']),
    amazonPrice: f['Price'] || undefined,
    status: 'draft',
    decisionDate: new Date().toISOString().split('T')[0],
  }

  Object.keys(doc).forEach(key => doc[key] === undefined && delete doc[key])

  const result = await sanityMutate([{ create: doc }])
  return result.results[0].id ?? result.results[0].documentId
}

async function main() {
  checkConfig()
  
  console.log('\n📤 Publish to Sanity')
  console.log('='.repeat(50))
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
  }

  const products = await fetchVerifiedProducts()
  
  if (products.length === 0) {
    console.log('\nNo verified products to publish.')
    console.log('Products need Status = "Verified" in Airtable.\n')
    return
  }

  console.log(`\nFound ${products.length} product(s) to publish:\n`)

  let published = 0
  let failed = 0

  for (const record of products) {
    const name = record.fields['Product Name']
    console.log(`\n📦 ${name}`)
    
    try {
      const sanityId = await createSanityProduct(record)
      console.log(`  ✓ Created in Sanity: ${sanityId}`)
      
      await updateAirtableStatus(record.id, 'Published')
      console.log(`  ✓ Updated Airtable status to "Published"`)
      
      published++
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`)
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✓ Published: ${published}`)
  if (failed > 0) console.log(`✗ Failed: ${failed}`)
  console.log()
  
  if (!DRY_RUN && published > 0) {
    console.log('Next steps:')
    console.log('1. Open Sanity Studio to review the new products')
    console.log('2. Add images and verify details')
    console.log('3. Change status from "Draft" to "Published"\n')
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
