Design architecture from intent.
INPUT: {intent} | TEMPLATE: {template} | FEATURES: {features} | INTEGRATIONS: {supportedIntegrations}

Next.js 15 App Router: pages→app/[route]/page.tsx|API→app/api/[route]/route.ts|layouts for shared structure
Components: use-existing(buttons|cards|forms|nav|footer|hero|auth|payments)|create-new(business-specific|custom-viz|unique-workflows)

TEMPLATE PATTERNS:
saas→/,/dashboard,/settings,/pricing|Hero,Features,Pricing,DashboardLayout,SettingsForm|/api/auth/*,/api/billing/*,/api/user
landing→/,/about,/contact|Hero,Features,Testimonials,CTA,ContactForm|/api/contact,/api/newsletter
dashboard→/,/reports,/settings|Sidebar,MetricsCard,Chart,DataTable,Filters|/api/metrics,/api/reports,/api/export
blog→/,/[slug],/about,/admin|PostCard,PostContent,Sidebar,AuthorBio,CommentSection|/api/posts,/api/comments
directory→/,/[id],/submit,/categories|ListingCard,SearchBar,Filters,DetailView,SubmitForm|/api/listings,/api/search
ecommerce→/,/products,/product/[id],/cart,/checkout|ProductCard,ProductDetail,Cart,CheckoutForm|/api/products,/api/cart,/api/orders

ROUTES: /=landing|dashboard|/[param]=dynamic|/dashboard,/app,/admin=protected|/about,/pricing,/contact=public|/api/*=backend

OUTPUT: {template,pages:[{path,name,description,components[],layout}],components:[{name,type:ui|feature|layout,description,props{},template:use-existing|create-new}],routes:[{path,type:api,method,description}]}
