import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface AirtableRecord {
  'Product Name': string;
  'Brand': string;
  'ASIN': string;
  'Amazon URL': string;
  'Category': string;
  'Subcategory': string;
  'Price': number;
  'Primary Material': string;
  'Coating': string;
  'PFAS Score': number;
  'Lab Tested': boolean;
  'Third-Party Certified': boolean;
  'Independent Testing': boolean;
  'Brand Statement': boolean;
  'Supply Chain Verified': boolean;
  'Inherently PFAS-Free': boolean;
  'Evidence Links': string;
  'Research Notes': string;
}

function calculateVerificationTier(record: AirtableRecord): number {
  const score = record['PFAS Score'] || 0;
  
  if (record['Lab Tested'] || record['Third-Party Certified']) {
    return score >= 8 ? 4 : 3;
  }
  if (record['Independent Testing'] || record['Brand Statement']) {
    return 2;
  }
  if (record['Inherently PFAS-Free']) {
    return 4;
  }
  return 1;
}

function determineClaimType(record: AirtableRecord): string {
  if (record['Inherently PFAS-Free']) {
    return 'inherently_pfas_free';
  }
  if (record['Lab Tested'] || record['Third-Party Certified']) {
    return 'intentionally_pfas_free';
  }
  return 'pfas_free_unknown_method';
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.WEBHOOK_SECRET;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data: AirtableRecord = await request.json();
    
    if (!data['Product Name']) {
      return NextResponse.json(
        { error: 'Product Name is required' },
        { status: 400 }
      );
    }

    const slug = slugify(data['Product Name']);
    
    const existingProduct = await sanityClient.fetch(
      `*[_type == "product" && slug.current == $slug][0]._id`,
      { slug }
    );

    const categorySlug = data['Subcategory'] 
      ? slugify(data['Subcategory'])
      : slugify(data['Category'] || 'uncategorized');
    
    const category = await sanityClient.fetch(
      `*[_type == "category" && slug.current == $slug][0]._id`,
      { slug: categorySlug }
    );

    const brandSlug = slugify(data['Brand'] || 'unknown');
    let brand = await sanityClient.fetch(
      `*[_type == "brand" && slug.current == $slug][0]._id`,
      { slug: brandSlug }
    );

    if (!brand && data['Brand']) {
      const newBrand = await sanityClient.create({
        _type: 'brand',
        name: data['Brand'],
        slug: { current: brandSlug },
        overallTrust: 'medium',
      });
      brand = newBrand._id;
    }

    const productDoc = {
      _type: 'product',
      name: data['Product Name'],
      slug: { current: slug },
      brand: brand ? { _type: 'reference', _ref: brand } : undefined,
      category: category ? { _type: 'reference', _ref: category } : undefined,
      materialSummary: data['Primary Material'],
      coatingSummary: data['Coating'] || 'None',
      verificationTier: calculateVerificationTier(data),
      claimType: determineClaimType(data),
      verificationRationale: data['Research Notes'],
      evidenceCount: [
        data['Lab Tested'],
        data['Third-Party Certified'],
        data['Independent Testing'],
        data['Brand Statement'],
        data['Supply Chain Verified'],
      ].filter(Boolean).length,
      decisionDate: new Date().toISOString().split('T')[0],
      amazonAsin: data['ASIN'],
      amazonPrice: data['Price'],
      amazonInStock: true,
      status: 'draft',
    };

    let result;
    
    if (existingProduct) {
      result = await sanityClient
        .patch(existingProduct)
        .set(productDoc)
        .commit();
    } else {
      result = await sanityClient.create(productDoc);
    }

    return NextResponse.json({
      success: true,
      sanityId: result._id,
      action: existingProduct ? 'updated' : 'created',
      productName: data['Product Name'],
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Airtable to Sanity webhook',
    usage: 'POST with Airtable record data',
  });
}
