#!/usr/bin/env node
/**
 * Fetch Amazon product images via Product Advertising API
 *
 * Populates data/amazon-images.json with image URLs for each ASIN.
 * Requires: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
 *
 * Setup: https://webservices.amazon.com/paapi5/documentation/
 * Apply for PA-API: Amazon Associates Central > Tools > Product Advertising API
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ASINS = [
  'B08L3RPVFZ', 'B08L3N8WTR', 'B07BKJZ6KS', 'B00006JSUA', 'B07YVL6TRT',
  'B01LZQMBPJ', 'B0BVMHP2JB', 'B00005AL4S', 'B00005QFQ8', 'B00CYKU6K8',
  'B000NZOKDC', 'B08H1RZX9H', 'B0841ZV47J', 'B001FQMPOE',
];

async function fetchImagesFromPAAPI() {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG || process.env.AMAZON_TAG || 'pfasfreekitch-20';

  if (!accessKey || !secretKey) {
    console.error('Missing AMAZON_ACCESS_KEY or AMAZON_SECRET_KEY. Set in .env.local');
    console.error('Get keys: Amazon Associates Central > Tools > Product Advertising API');
    process.exit(1);
  }

  let paapi;
  try {
    paapi = await import('amazon-paapi');
  } catch (e) {
    console.error('Install amazon-paapi: npm install amazon-paapi');
    process.exit(1);
  }

  const commonParams = {
    AccessKey: accessKey,
    SecretKey: secretKey,
    PartnerTag: partnerTag,
    Marketplace: 'www.amazon.com',
  };

  const results = {};
  const batchSize = 10;

  for (let i = 0; i < ASINS.length; i += batchSize) {
    const batch = ASINS.slice(i, i + batchSize);
    try {
      const response = await paapi.GetItems(commonParams, {
        ItemIds: batch,
        ItemIdType: 'ASIN',
        Resources: ['Images.Primary.Large', 'Images.Primary.Medium'],
      });

      const items = response?.ItemsResult?.Items ?? response?.ItemsResult?.Item ?? [];
      for (const item of Array.isArray(items) ? items : [items]) {
        if (!item) continue;
        const asin = item.ASIN ?? item.Asin;
        const url = item.Images?.Primary?.Large?.URL
          ?? item.Images?.Primary?.Medium?.URL
          ?? item.Images?.Primary?.Small?.URL;
        if (asin && url) {
          results[asin] = url;
        }
      }
    } catch (err) {
      console.error('PA-API error for batch:', batch, err.message);
    }
  }

  return results;
}

async function main() {
  const imagesPath = join(__dirname, '../data/amazon-images.json');
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(imagesPath, 'utf8'));
  } catch (_) {}

  const fetched = await fetchImagesFromPAAPI();
  const merged = { ...existing };

  for (const asin of ASINS) {
    if (fetched[asin]) {
      merged[asin] = fetched[asin];
    } else if (merged[asin] === undefined) {
      merged[asin] = null;
    }
  }

  writeFileSync(imagesPath, JSON.stringify(merged, null, 2));
  console.log(`Updated ${imagesPath} with ${Object.values(fetched).filter(Boolean).length} image URLs`);
}

main().catch(console.error);
