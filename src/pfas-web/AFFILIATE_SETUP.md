# Affiliate Setup Guide

You've set up accounts with **Amazon Associates**, **CJ Affiliate**, and **Awin**. Here's how to configure them in the website.

## Quick Setup

### 1. Amazon Associates

Find your Associate Tag in your Amazon Associates dashboard (looks like `yourname-20`).

Edit `lib/affiliate.ts` and replace:
```typescript
amazon: {
  tag: 'YOUR_AMAZON_TAG', // Replace with your actual tag
  enabled: true,
},
```

### 2. CJ Affiliate

Find your Publisher ID (PID) in CJ's Account Settings.

Edit `lib/affiliate.ts` and replace:
```typescript
cj: {
  publisherId: 'YOUR_CJ_PID', // Replace with your actual PID
  enabled: true,
  merchants: {
    // Add brands as you join their programs:
    // 'caraway': { advertiserId: '1234567', linkId: '12345678' },
  },
},
```

### 3. Awin

Find your Publisher ID in Awin's dashboard.

Edit `lib/affiliate.ts` and replace:
```typescript
awin: {
  publisherId: 'YOUR_AWIN_ID', // Replace with your actual ID
  enabled: true,
  merchants: {
    // Add brands as you join their programs:
    // 'le-creuset': '12345',
  },
},
```

---

## Adding Products

### Option A: Edit CSV (for bulk imports)

Edit `data/products.csv` to add/update products. This is useful for:
- Bulk data entry
- Importing from spreadsheets
- Sharing with non-technical team members

### Option B: Edit TypeScript (for full control)

Edit `data/products.ts` directly. This gives you:
- Type safety
- IDE autocomplete
- Immediate validation

---

## Your Amazon Links

For each product, add the Amazon ASIN (the ID in Amazon URLs):

```
https://www.amazon.com/dp/B08L3RPVFZ ← ASIN is B08L3RPVFZ
```

The products.ts file already includes ASINs for popular PFAS-free products.

---

## Joining Brand Programs

### Priority Brands on CJ Affiliate

Search for these in CJ's advertiser search:
- Williams Sonoma (Sur La Table)
- Bed Bath & Beyond
- Macy's
- Wayfair

### Priority Brands on Awin

Search for these in Awin's advertiser search:
- GreenPan (via The Cookware Company)
- Various European brands

### Direct Brand Programs

Some brands have direct affiliate programs with higher commissions:
- **Caraway**: https://www.carawayhome.com/pages/affiliate
- **Made In**: https://madeincookware.com/pages/affiliate
- **Our Place**: https://fromourplace.com/pages/affiliate
- **Xtrema**: https://xtrema.com/pages/affiliate

---

## Commission Rates (Estimated)

| Network | Category | Rate |
|---------|----------|------|
| Amazon | Kitchen/Home | 3-4% |
| CJ Affiliate | Cookware brands | 5-10% |
| Awin | Cookware brands | 5-10% |
| Direct (brand sites) | Varies | 8-15% |

---

## Tracking Verification

1. Click an affiliate link on your site
2. Check that:
   - Amazon links have your `?tag=` parameter
   - CJ links redirect through `anrdoezrs.net` or similar
   - Awin links redirect through `awin1.com`
3. Check your affiliate dashboards for click tracking within 24 hours

---

## Files Reference

| File | Purpose |
|------|---------|
| `lib/affiliate.ts` | Affiliate IDs and link generation |
| `lib/tracking.ts` | Click tracking and analytics |
| `data/products.ts` | Product database with affiliate links |
| `data/products.csv` | Spreadsheet version for bulk editing |

---

## Amazon Product Images

To show the **exact same images** as Amazon (instead of placeholders):

1. Apply for [Product Advertising API](https://affiliate-program.amazon.com/) access
2. Add credentials to `.env.local`: `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`
3. Run: `npm install amazon-paapi && npm run fetch-amazon-images`

See `docs/AMAZON_IMAGES_SETUP.md` for full instructions.

---

## Next Steps

1. [ ] Replace `YOUR_AMAZON_TAG` with your actual Amazon Associates tag
2. [ ] Replace `YOUR_CJ_PID` with your CJ Publisher ID
3. [ ] Replace `YOUR_AWIN_ID` with your Awin Publisher ID
4. [ ] Apply to brand programs on CJ and Awin
5. [ ] Add merchant IDs as you get approved
6. [ ] Test affiliate links work correctly
7. [ ] Deploy and start earning!
