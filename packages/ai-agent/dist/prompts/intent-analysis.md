Analyze project description, extract intent for Dawson Framework.
USER: {description}

TEMPLATES: saas(auth+billing+db)|landing-page(marketing)|dashboard(analytics)|blog(content)|directory(SEO listings)|ecommerce(products+cart)
INTEGRATIONS: Auth:supabase|clerk | Payments:stripe|paddle | Email:resend|sendgrid | DB:supabase|planetscale | AI:openai|anthropic | Analytics:posthog|plausible

OUTPUT JSON: {category, confidence:0-1, reasoning, suggestedTemplate, features[], integrations:{auth?,payments?,email?,db?,ai?,analytics?}, complexity:simple|moderate|complex, keyEntities[]}

TEMPLATE TRIGGERS:
SaaS: subscription|users|auth|dashboard|billing|platform → multi-user, recurring revenue
Landing: marketing|conversion|launch|landing|website|showcase → single-page, conversion focus
Dashboard: admin|analytics|charts|internal|metrics|visualization → data-heavy, reports
Blog: articles|posts|content|writing|publishing|news → content-focused, categories/tags
Directory: listings|catalog|search|browse|categories|marketplace → SEO, search/filter
Ecommerce: products|cart|checkout|inventory|shop|store|buy|sell → catalog, payment flow

INTEGRATION DEFAULTS:
Auth: login|users|auth|signup|accounts|members → supabase
Payments: pricing|subscription|pay|checkout|billing|monetization → stripe
DB: data persistence implied → supabase
Email: notifications|newsletter|transactional|contact → resend
AI: chatbot|recommendations|AI|ML|intelligent → anthropic
Analytics: tracking|metrics|insights|analytics|reporting → posthog

Complexity: simple=1purpose+CRUD | moderate=multi-feature+integrations | complex=many features+custom workflows
Key Entities: fitness→User|Workout|Exercise|Progress | recipe blog→Recipe|Ingredient|Author|Category | task mgr→User|Task|Project|Comment
