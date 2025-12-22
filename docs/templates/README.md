# Template Documentation

Complete guide to all available templates in the Dawson Does Framework.

## Table of Contents

- [Overview](#overview)
- [Template Comparison](#template-comparison)
- [How to Choose](#how-to-choose-the-right-template)
- [Quick Start](#quick-start)
- [Template Guides](#template-guides)
- [Creating Custom Templates](#creating-custom-templates)

## Overview

Templates are production-ready project starters that include everything you need to build and deploy modern web applications. Each template is built with Next.js 15, React 19, TypeScript, and Tailwind CSS, and can be extended with integrations for authentication, payments, databases, and more.

### Available Templates

| Template | Category | Use Case | Complexity |
|----------|----------|----------|------------|
| [SaaS Starter](#saas-starter) | SaaS | Subscription-based web apps | Advanced |
| [Dashboard](#dashboard) | Admin | Internal tools and admin panels | Intermediate |
| [Landing Page](#landing-page) | Marketing | Product launches and marketing sites | Beginner |
| [Blog](#blog) | Content | Content-focused websites | Beginner |
| [SEO Directory](#seo-directory) | Directory | Curated lists and resource directories | Intermediate |

## Template Comparison

### Feature Matrix

| Feature | SaaS | Dashboard | Landing | Blog | Directory |
|---------|------|-----------|---------|------|-----------|
| **Authentication** | Required | Optional | No | No | Optional |
| **Database** | Required | Optional | No | No | Optional |
| **Payments** | Built-in | Optional | Optional | No | No |
| **Admin UI** | Yes | Yes | No | No | Yes |
| **SEO Optimized** | Yes | No | Yes | Yes | Yes |
| **Static Export** | No | No | Yes | Yes | Yes |
| **User Dashboard** | Yes | Yes | No | No | No |
| **Content Management** | No | No | No | Yes | Yes |
| **Integration Ready** | Yes | Yes | Optional | No | Optional |

### Tech Stack Comparison

All templates share a core stack:
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Turbopack (dev)

Additional packages by template:

| Template | Additional Packages |
|----------|-------------------|
| **SaaS** | Supabase, Stripe, React Hook Form, Zod |
| **Dashboard** | Recharts, Radix UI, date-fns |
| **Landing** | Framer Motion (optional), React Intersection Observer |
| **Blog** | gray-matter, remark, rehype, RSS |
| **Directory** | shadcn/ui, Fuse.js, React Table |

## How to Choose the Right Template

### Choose SaaS Starter if you need:

- User authentication and authorization
- Subscription billing (recurring revenue)
- User accounts and profiles
- Database for storing user data
- Multi-tenant architecture
- Payment processing
- Email notifications
- User dashboard

**Best for:** B2B SaaS, productivity apps, membership sites, online platforms

**Example projects:** Project management tool, analytics platform, team collaboration software

### Choose Dashboard if you need:

- Admin panel for managing data
- Data visualization with charts
- Tables with sorting and filtering
- Sidebar navigation
- Settings management
- Internal tools

**Best for:** Internal tools, admin panels, data management, analytics dashboards

**Example projects:** CRM admin panel, analytics dashboard, content moderation tool

### Choose Landing Page if you need:

- Marketing website
- Product showcase
- Lead generation
- Call-to-action focused
- SEO optimization
- Fast page loads
- Mobile responsive

**Best for:** Product launches, marketing campaigns, lead generation, portfolios

**Example projects:** SaaS marketing site, product landing page, agency portfolio

### Choose Blog if you need:

- Content publishing
- Blog posts with MDX
- Categories and tags
- Author profiles
- RSS feed
- Search functionality
- SEO optimization

**Best for:** Personal blogs, company blogs, content marketing, documentation

**Example projects:** Developer blog, company blog, tech publication, documentation site

### Choose SEO Directory if you need:

- Curated resource lists
- Directory of tools/services
- Search and filtering
- Category organization
- Static site generation
- High SEO performance
- Beautiful UI with shadcn/ui

**Best for:** Tool directories, resource lists, curated collections

**Example projects:** Developer tools directory, startup resources, design asset library

## Quick Start

### List Available Templates

```bash
# See all templates
framework templates list

# Filter by category
framework templates list --category SaaS

# Search templates
framework templates search "blog"
```

### Get Template Info

```bash
# Detailed template information
framework templates info saas
framework templates info dashboard
framework templates info landing-page
```

### Export a Template

```bash
# Basic export
framework export saas ./my-saas-app

# Export with integrations
framework export saas ./my-app --auth supabase --db supabase --payments stripe

# Export and install dependencies
framework export dashboard ./my-dashboard && cd my-dashboard && npm install
```

### Start Development

```bash
cd my-app
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Template Guides

### Detailed Documentation

Each template has comprehensive documentation covering:

1. **What's Included** - Complete feature breakdown
2. **When to Use** - Use cases and scenarios
3. **File Structure** - Architecture and organization
4. **Customization** - How to modify and extend
5. **Integrations** - Compatible services and APIs
6. **Deployment** - Production deployment guides
7. **Examples** - Real-world projects built with the template

### Read the Guides

- [SaaS Starter Guide](./saas.md) - Full-stack SaaS applications
- [Dashboard Guide](./dashboard.md) - Admin panels and data visualization
- [Landing Page Guide](./landing-page.md) - Marketing and product pages
- [Blog Guide](./blog.md) - Content publishing and blogging
- [Creating Templates Guide](./creating-templates.md) - Build your own templates

## Integration Support

### Integrations Available

Templates support various integrations that can be added during export or after:

**Authentication:**
- Supabase Auth
- Clerk
- Auth.js (NextAuth)

**Payments:**
- Stripe
- Paddle
- Lemon Squeezy

**Databases:**
- Supabase (PostgreSQL)
- PlanetScale (MySQL)
- Prisma + any DB

**Email:**
- Resend
- SendGrid
- Postmark

**AI:**
- OpenAI
- Anthropic Claude
- Hugging Face

**Analytics:**
- PostHog
- Plausible
- Vercel Analytics

### Adding Integrations

```bash
# During export
framework export saas ./my-app --auth supabase --payments stripe

# After export
cd my-app
framework integrate auth supabase
framework integrate payments stripe
```

See [Integration Documentation](../integrations/README.md) for details.

## Template Features

### Common Features (All Templates)

All templates include:

- Next.js 15 App Router
- React 19 with Server Components
- TypeScript with strict mode
- Tailwind CSS v4 alpha
- ESLint configuration
- Prettier configuration
- Git-ready with .gitignore
- Environment variable support
- Production-ready build config
- Deployment guides (Vercel, Netlify, Cloudflare)

### Template-Specific Features

Each template adds features specific to its use case. See individual template guides for complete feature lists.

## Customization

### Basic Customization

All templates are designed to be customized:

1. **Styling:** Modify `tailwind.config.ts` and global CSS
2. **Components:** Edit components in `/components` directory
3. **Pages:** Add/modify pages in `/app` directory
4. **Configuration:** Update `next.config.js` and TypeScript config
5. **Environment:** Configure `.env.local` for API keys

### Advanced Customization

- Add new integrations
- Extend with custom capabilities
- Modify build configuration
- Add custom middleware
- Implement custom layouts

See individual template guides for customization examples.

## Deployment

### Supported Platforms

All templates can be deployed to:

- **Vercel** (recommended) - Zero config deployment
- **Netlify** - Static export support
- **Cloudflare Pages** - Edge deployment
- **Railway** - Full-stack deployment
- **Fly.io** - Container deployment
- **AWS Amplify** - AWS integration
- **Docker** - Self-hosted

### Quick Deploy

```bash
# Vercel
vercel deploy

# Netlify
netlify deploy

# Build for production
npm run build
npm start
```

See [Deployment Guide](../deploy/README.md) for platform-specific instructions.

## Best Practices

### Template Usage

1. **Start with the right template** - Choose based on your use case
2. **Use integrations** - Don't build auth/payments from scratch
3. **Customize gradually** - Start with the defaults, then customize
4. **Follow the structure** - Keep the organization consistent
5. **Test thoroughly** - Test locally before deploying
6. **Update dependencies** - Keep packages up to date
7. **Read the docs** - Each template has specific guidance

### Development Workflow

```bash
# 1. Export template
framework export saas ./my-app --auth supabase

# 2. Install dependencies
cd my-app && npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start development
npm run dev

# 5. Build and test
npm run build
npm start

# 6. Deploy
vercel deploy
```

## Version Compatibility

### Framework Versions

Each template specifies minimum framework version requirements:

```json
{
  "minFrameworkVersion": "0.1.0"
}
```

Check compatibility:

```bash
framework templates info saas
# Shows: Framework Compatibility
#   Requires: v0.1.0 or higher
#   Current:  v0.2.0
#   Status:   ✅ Compatible
```

### Dependency Versions

Templates use latest stable versions:
- **Next.js:** 15.x
- **React:** 19.x
- **TypeScript:** 5.x
- **Tailwind:** 4.x alpha

Update dependencies:

```bash
npm update
# or for latest
npm install next@latest react@latest react-dom@latest
```

## Creating Custom Templates

Want to create your own template? See the [Creating Templates Guide](./creating-templates.md) for:

- Template structure requirements
- Metadata format
- Integration hooks
- Publishing templates
- Best practices
- Example walkthrough

## Community Templates

### Finding Templates

```bash
# Search community templates
framework templates search --remote

# Add remote registry
framework config registries add https://registry.example.com
```

### Contributing Templates

Share your templates with the community:

1. Create template following guidelines
2. Add comprehensive documentation
3. Test thoroughly
4. Submit to template registry
5. Publish on npm or GitHub

See [Contributing Guide](../CONTRIBUTING.md) for details.

## Examples

### Real-World Projects

Projects built with these templates:

**SaaS Template:**
- Project management tools
- Analytics platforms
- Team collaboration apps
- Customer portals

**Dashboard Template:**
- Admin panels
- Analytics dashboards
- CRM interfaces
- Data management tools

**Landing Page Template:**
- Product marketing sites
- Agency portfolios
- App landing pages
- Lead generation sites

**Blog Template:**
- Developer blogs
- Company blogs
- Technical documentation
- Content marketing sites

**Directory Template:**
- Tool directories
- Resource collections
- Startup directories
- Design asset libraries

## Troubleshooting

### Common Issues

**Template not found:**
```bash
# List all templates
framework templates list

# Check template ID
framework templates info <template-id>
```

**Integration fails:**
```bash
# Check integration compatibility
framework templates info saas
# Look for supportedIntegrations

# Verify integration is installed
framework integrations list
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

**Environment variables:**
```bash
# Copy example file
cp .env.example .env.local

# Verify variables are loaded
npm run dev
# Check terminal output for missing vars
```

## Support

### Get Help

- **Documentation:** [docs.dawsonframework.com](https://github.com/jrdaws/dawson-does-framework)
- **Issues:** [GitHub Issues](https://github.com/jrdaws/dawson-does-framework/issues)
- **Discussions:** [GitHub Discussions](https://github.com/jrdaws/dawson-does-framework/discussions)
- **Examples:** [Template Examples](../examples/)

### Contributing

We welcome contributions:

- Report bugs and issues
- Request new features
- Submit pull requests
- Share your templates
- Improve documentation

See [Contributing Guide](../CONTRIBUTING.md)

## Next Steps

1. [Choose your template](#how-to-choose-the-right-template)
2. Read the [detailed guide](./saas.md) for your chosen template
3. Follow the [Quick Start](#quick-start) to export and run
4. Add [integrations](../integrations/README.md) as needed
5. Deploy to [production](../deploy/README.md)

## License

All official templates are MIT licensed and free to use in commercial projects.

---

**Need help?** Check out the [Getting Started Guide](../getting-started/README.md) or open an [issue](https://github.com/jrdaws/dawson-does-framework/issues).
