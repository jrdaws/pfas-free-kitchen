Design architecture from intent for Dawson Framework.
INTENT: {intent}
TEMPLATE: {template} | FEATURES: {features} | INTEGRATIONS: {supportedIntegrations}

OUTPUT JSON: {template, pages:[{path,name,description,components[],layout}], components:[{name,type:ui|feature|layout,description,props{},template:use-existing|create-new}], routes:[{path,type:api,method,description}]}

PRINCIPLES:
1. Next.js 15 App Router: pages→app/[route]/page.tsx | API→app/api/[route]/route.ts | layouts for shared structure
2. Reuse: buttons|cards|forms|nav|footer|hero→use-existing | custom business logic→create-new
3. Component types: ui=generic | feature=business-specific | layout=structure
4. Pages: 1 purpose, list components, layout (default|auth|dashboard)
5. API: RESTful (GET=fetch, POST=create), mirror integrations
6. Integration-aware: auth→login+protected | payments→pricing+checkout | db→fetching | email→notifications

TEMPLATE PATTERNS:
SaaS: /|/dashboard|/settings|/pricing → Hero|Features|Pricing|DashboardLayout|SettingsForm → /api/auth|billing|user
Landing: /|/about|/contact → Hero|Features|Testimonials|CTA|ContactForm → /api/contact|newsletter
Dashboard: /|/reports|/settings → Sidebar|MetricsCard|Chart|DataTable|Filters → /api/metrics|reports|export
Blog: /|/[slug]|/about|/admin → PostCard|PostContent|Sidebar|AuthorBio|CommentSection → /api/posts|comments|admin
Directory: /|/[id]|/submit|/categories → ListingCard|SearchBar|Filters|DetailView|SubmitForm → /api/listings|search|submit
Ecommerce: /|/products|/product/[id]|/cart|/checkout → ProductCard|ProductDetail|Cart|CheckoutForm|OrderSummary → /api/products|cart|checkout|orders

COMPONENTS: use-existing→buttons|inputs|cards|modals|nav|footer|hero|features|auth|payment | create-new→business logic|custom viz|unique workflows
ROUTES: /=landing|dashboard | /[param]=dynamic | /dashboard|/app|/admin=protected | /about|/pricing|/contact|/blog=public | /api/*=backend
