# VA Guide: Updating PFAS-Free Kitchen Product Links

## Overview

This guide provides step-by-step instructions for Virtual Assistants to update product information and affiliate links on the PFAS-Free Kitchen website.

---

## Quick Reference

| Task | File to Edit | Difficulty |
|------|--------------|------------|
| Update Amazon link | `src/pfas-web/data/products.ts` | Easy |
| Update price | `src/pfas-web/data/products.ts` | Easy |
| Add new product | `src/pfas-web/data/products.ts` | Medium |
| Add new brand | `src/pfas-web/data/products.ts` | Medium |

---

## Prerequisites

Before starting, ensure you have:
- [ ] Access to the GitHub repository
- [ ] VS Code or text editor installed
- [ ] Git installed and configured
- [ ] RoboForm credentials for shared passwords

---

## Workflow 1: Update an Existing Product Link

### When to Use
- Amazon link is broken or outdated
- Product ASIN has changed
- Price needs updating

### Step-by-Step Instructions

1. **Open the products file**
   ```
   src/pfas-web/data/products.ts
   ```

2. **Find the product** using Ctrl+F (Cmd+F on Mac)
   - Search for the product name OR
   - Search for the current ASIN (the 10-character code like `B00006JSUA`)

3. **Locate the Amazon link**
   Look for a section like this:
   ```typescript
   retailers: [
     {
       id: 'lodge-amazon',
       retailer: RETAILERS.amazon,
       url: generateAmazonLink('B00006JSUA'),  // <-- ASIN is here
       price: 32,                               // <-- Price is here
       currency: 'USD',
       inStock: true,
     },
   ],
   ```

4. **Update the ASIN**
   - Go to Amazon and find the correct product
   - Get the ASIN from the URL: `amazon.com/dp/B00006JSUA`
   - The 10-character code after `/dp/` is the ASIN
   - Replace the old ASIN with the new one

5. **Update the price**
   - Change the `price` value to the current Amazon price
   - Round to the nearest dollar (no cents)

6. **Save and commit**
   ```bash
   git add src/pfas-web/data/products.ts
   git commit -m "fix: update [product name] Amazon link and price"
   git push
   ```

### Example: Updating Lodge Cast Iron Skillet

**Before:**
```typescript
url: generateAmazonLink('B00006JSUA'),
price: 32,
```

**After (if ASIN changed and price increased):**
```typescript
url: generateAmazonLink('B000NEW123'),
price: 35,
```

---

## Workflow 2: Add a New Product

### When to Use
- Adding a product from our research list
- Adding a newly discovered PFAS-free product

### Step-by-Step Instructions

1. **Gather product information**
   - Product name (official, from Amazon)
   - Brand name
   - Amazon ASIN
   - Current price
   - Product description
   - Material information
   - Category (cookware, bakeware, storage, appliances)

2. **Check if the brand exists**
   Search for the brand in `BRANDS` section at the top of `products.ts`
   - If it exists: note the brand key (e.g., `BRANDS.lodge`)
   - If not: add it first (see Workflow 3)

3. **Check if the category exists**
   Search in `CATEGORIES` section
   - If it exists: note the category key (e.g., `CATEGORIES['fry-pans']`)
   - If not: add it first (see Workflow 4)

4. **Add the product**
   Copy this template and fill in the values:

```typescript
  {
    id: 'brand-product-name',           // lowercase with hyphens
    name: 'Brand Full Product Name',    // Exact name from Amazon
    slug: 'brand-product-name',         // Same as id
    description: 'Product description with PFAS-free info.',
    imageUrl: '/placeholders/products/skillet-placeholder.svg',
    images: [
      { url: '/placeholders/products/skillet-placeholder.svg', alt: 'Product Name', isPrimary: true },
    ],
    brand: BRANDS.brandkey,             // Use the brand key
    category: CATEGORIES['category'],   // Use the category key
    materialSummary: 'Main material',   // e.g., 'Cast iron'
    coatingSummary: 'Coating type',     // e.g., 'None' or 'Ceramic non-stick'
    verification: {
      tier: 4 as VerificationTier,      // 4 = inherently safe, 3 = lab tested
      claimType: 'inherently_pfas_free', // or 'intentionally_pfas_free'
      scopeText: 'All products',
      rationale: 'Why this is PFAS-free',
      unknowns: [],
      hasEvidence: true,
      evidenceCount: 2,
      decisionDate: '2026-02-16',       // Today's date
    },
    components: [
      {
        id: 'body',
        role: 'body',
        roleLabel: 'Product Body',
        material: { id: 'material-id', name: 'Material Name', slug: 'material-slug' },
        pfasStatus: 'verified_free',
      },
    ],
    retailers: [
      {
        id: 'brand-amazon',
        retailer: RETAILERS.amazon,
        url: generateAmazonLink('B00XXXXXX'),  // Replace with real ASIN
        price: 99,                              // Current price
        currency: 'USD',
        inStock: true,
      },
    ],
    features: {
      inductionCompatible: true,        // true/false
      ovenSafeTempF: 500,               // Max oven temp, or undefined
      dishwasherSafe: true,             // true/false
    },
  },
```

5. **Add at the end of the PRODUCTS array**
   Find the closing `];` of the PRODUCTS array and add your product before it.

6. **Save and commit**
   ```bash
   git add src/pfas-web/data/products.ts
   git commit -m "feat: add [product name] to products database"
   git push
   ```

---

## Workflow 3: Add a New Brand

### Step-by-Step Instructions

1. **Open products.ts**

2. **Find the BRANDS section** (near the top)

3. **Add the new brand** in alphabetical order:
```typescript
  brandkey: {
    id: 'brandkey',
    name: 'Brand Display Name',
    slug: 'brand-slug',
    logoUrl: '/images/brands/brand-name.png',  // Can be undefined if no logo
  },
```

4. **Example: Adding Vitamix**
```typescript
  vitamix: {
    id: 'vitamix',
    name: 'Vitamix',
    slug: 'vitamix',
    logoUrl: '/images/brands/vitamix.png',
  },
```

---

## Workflow 4: Add a New Category

### Step-by-Step Instructions

1. **Find the CATEGORIES section**

2. **Add the new category**:
```typescript
  'category-slug': {
    id: 'category-slug',
    name: 'Category Display Name',
    slug: 'category-slug',
    path: [
      { id: 'parent', name: 'Parent Category', slug: 'parent' },
      { id: 'category-slug', name: 'Category Display Name', slug: 'category-slug' },
    ],
  },
```

3. **Example: Adding Blenders**
```typescript
  'blenders': {
    id: 'blenders',
    name: 'Blenders',
    slug: 'blenders',
    path: [
      { id: 'appliances', name: 'Appliances', slug: 'appliances' },
      { id: 'blenders', name: 'Blenders', slug: 'blenders' },
    ],
  },
```

---

## Finding Amazon ASINs

### Method 1: From URL
1. Go to the product on Amazon
2. Look at the URL: `https://www.amazon.com/dp/B00006JSUA`
3. The ASIN is the 10-character code after `/dp/`

### Method 2: From Product Page
1. Scroll down to "Product Information" section
2. Look for "ASIN" row
3. Copy the 10-character code

### Method 3: From Search
1. Right-click product image in search results
2. "Copy link address"
3. Extract ASIN from the URL

---

## Verification Score Reference

| Score | Meaning | Example Materials |
|-------|---------|-------------------|
| 10/10 | Inherently PFAS-free | Cast iron, stainless steel, glass, wood, titanium |
| 9/10 | Lab-tested PFAS-free | Ceramic coating (GreenPan Thermolon) |
| 8/10 | Brand-verified PFAS-free | Some ceramic coatings, silicone |

### Claim Types
- `inherently_pfas_free` - Material cannot contain PFAS (iron, steel, glass, wood)
- `intentionally_pfas_free` - Coating/material designed to be PFAS-free

---

## Troubleshooting

### "Product not showing on website"
1. Check the file saved correctly
2. Make sure there are no syntax errors (missing commas, brackets)
3. Verify the Git push succeeded

### "Amazon link shows wrong product"
1. Verify the ASIN is correct
2. Check Amazon hasn't merged/changed the listing
3. Search for the product fresh and get the new ASIN

### "Price is outdated"
1. Prices change frequently on Amazon
2. Update monthly or when noticed
3. Round to nearest dollar

---

## Quality Checklist

Before committing changes, verify:
- [ ] Product name matches Amazon exactly
- [ ] ASIN is 10 characters (letters and numbers)
- [ ] Price is current (check Amazon)
- [ ] Category makes sense for the product
- [ ] Brand exists or has been added
- [ ] No duplicate products
- [ ] File has no syntax errors (no red squiggles in VS Code)

---

## Getting Help

If you encounter issues:
1. Check this guide first
2. Search existing products for similar examples
3. Contact the project lead via Slack/email
4. Never commit broken code - ask for help!

---

## Reference: Product Research File

All verified PFAS-free products are documented in:
```
data/pfas-free-products-research.md
```

This file contains:
- Product names and brands
- Amazon ASINs
- Prices
- PFAS safety scores
- Direct Amazon URLs

Use this as your source when adding new products to the website.
