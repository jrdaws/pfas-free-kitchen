# Amazon Product Images Setup

To display the **exact same product images** shown on Amazon (instead of placeholders), you need to fetch image URLs via Amazon's Product Advertising API.

## Requirements

- Amazon Associates account (you have this)
- **Product Advertising API (PA-API) access** — apply separately at [Amazon Associates Central](https://affiliate-program.amazon.com/) → Tools → Product Advertising API

## Quick Setup

### 1. Apply for PA-API Access

1. Go to [Amazon Associates Central](https://affiliate-program.amazon.com/)
2. Navigate to **Tools** → **Product Advertising API**
3. Apply for API access (requires 3+ qualifying sales in the first 180 days for full access)
4. Once approved, you'll get **Access Key** and **Secret Key**

### 2. Add Credentials

Create or edit `src/pfas-web/.env.local`:

```
AMAZON_ACCESS_KEY=your_access_key_here
AMAZON_SECRET_KEY=your_secret_key_here
AMAZON_PARTNER_TAG=pfasfreekitch-20
```

### 3. Fetch Images

```bash
cd src/pfas-web
npm install amazon-paapi
npm run fetch-amazon-images
```

This populates `data/amazon-images.json` with image URLs. The site will automatically use them.

### 4. Redeploy

Commit the updated `amazon-images.json` and push. Product images will now match Amazon.

---

## Manual Fallback (No PA-API Yet)

If you don't have PA-API access yet:

1. Open each Amazon product page (e.g. `https://www.amazon.com/dp/B08L3RPVFZ`)
2. Right-click the main product image → **Copy image address**
3. Edit `data/amazon-images.json` and add the URL for that ASIN:

```json
{
  "B08L3RPVFZ": "https://m.media-amazon.com/images/I/41xxxxx.jpg"
}
```

**Note:** Amazon's terms require using approved methods (PA-API or SiteStripe). Manual URLs from product pages may work for testing but PA-API is the compliant approach.

---

## How It Works

- `data/amazon-images.json` maps ASIN → image URL
- `data/products.ts` enriches each product with its Amazon image when available
- `next.config.js` allows `m.media-amazon.com` for the Next.js Image component
- When no Amazon image exists, placeholders are used

---

## Troubleshooting

**"Missing AMAZON_ACCESS_KEY"** — Add credentials to `.env.local`

**"Request failed" / "InvalidClientTokenId"** — Check your Access Key and Secret Key. Ensure PA-API access is approved.

**Images not showing** — Verify URLs in `amazon-images.json` are valid. Check browser console for CORS or 403 errors.
