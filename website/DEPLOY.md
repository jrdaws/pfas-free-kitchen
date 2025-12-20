# Deployment Guide

This landing page is configured for static export and can be deployed to any static hosting platform.

## Quick Deploy

### Vercel (Recommended)

```bash
# From website/ directory
npm install -g vercel
vercel

# Or connect your GitHub repo in Vercel dashboard
# Settings will be auto-detected from vercel.json
```

Configuration is already set in `vercel.json`:
- Build Command: `npm run build`
- Output Directory: `out`
- Clean URLs enabled

### Netlify

```bash
# From website/ directory
npm install -g netlify-cli
netlify deploy --prod --dir=out

# Or drag-and-drop the /out folder to Netlify dashboard
```

Configuration is already set in `netlify.toml`:
- Build Command: `npm run build`
- Publish Directory: `out`
- SPA fallback enabled

### GitHub Pages

```bash
# Build the site
npm run build

# The /out directory is your static site
# Push to gh-pages branch or configure GitHub Pages to use /out
```

Add to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./website
        run: npm install

      - name: Build
        working-directory: ./website
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website/out
```

### Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Configure build settings:
   - Build command: `cd website && npm install && npm run build`
   - Build output directory: `website/out`
   - Root directory: `/`

### Custom Server

The `/out` directory contains a fully static site that can be served with any web server:

```bash
# Using Python
cd out && python -m http.server 8000

# Using Node http-server
npx http-server out -p 8000

# Using nginx
# Copy /out contents to your nginx web root
cp -r out/* /var/www/html/
```

## Custom Domain

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS records as shown

### GitHub Pages
1. Add `CNAME` file to `/out` directory with your domain
2. Configure DNS A records to GitHub Pages IPs

## Environment Variables

This site has no environment variables (fully static). All content is built at compile time.

## CDN & Performance

The static export is optimized for CDN delivery:
- All pages pre-rendered
- CSS inlined in critical path
- No client-side data fetching
- Aggressive caching recommended

Suggested cache headers:
```
/_next/static/*:
  Cache-Control: public, max-age=31536000, immutable

/*.html:
  Cache-Control: public, max-age=3600, must-revalidate
```

## Monitoring

Once deployed, monitor:
- Lighthouse score (target: >90)
- Core Web Vitals
- Page load time (<1s target)

Tools:
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Troubleshooting

### Build fails
- Ensure Node.js 20+ is installed
- Run `npm install` in website/ directory
- Check for TypeScript errors: `npm run build`

### Styles not loading
- Verify `/_next/static/` directory exists in /out
- Check build output for CSS generation
- Ensure Tailwind config is correct

### 404 errors
- Verify `trailingSlash: true` in next.config.js
- Check routing configuration in deployment platform
- Ensure SPA fallback is disabled (we're fully static)

### Fonts not loading
- Google Fonts imported in globals.css
- Verify internet connection during build
- Consider self-hosting fonts for offline support

## Analytics (Optional)

Add analytics by modifying `app/layout.tsx`:

```tsx
// Example: Plausible
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>

// Example: Simple Analytics
<script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
```

## Updates

To update the live site:

```bash
# Make changes to code
# Commit to git
git add .
git commit -m "Update landing page"
git push

# Rebuild and redeploy
npm run build

# Vercel: auto-deploys on push
# Netlify: auto-deploys on push or run netlify deploy
# Others: manually copy /out to hosting
```

## Support

- Landing page issues: [GitHub Issues](https://github.com/jrdaws/dawson-does-framework/issues)
- Framework docs: [GitHub](https://github.com/jrdaws/dawson-does-framework)
- npm package: [@jrdaws/framework](https://www.npmjs.com/package/@jrdaws/framework)
