Analyze project, output JSON intent.
INPUT: {description}

TEMPLATES: saas(auth+billing+dashboard)|landing-page(marketing+conversion)|dashboard(analytics+reports)|blog(content+publishing)|directory(SEO+listings)|ecommerce(products+cart+checkout)

DETECT TEMPLATE:
saas→subscription|users|auth|dashboard|billing|platform|accounts|SaaS|members
landing→marketing|conversion|launch|showcase|website|landing|homepage|promo
dashboard→admin|analytics|charts|metrics|internal|reports|visualization|data
blog→articles|posts|content|writing|publishing|news|editorial|magazine
directory→listings|catalog|search|browse|categories|marketplace|directory
ecommerce→products|cart|checkout|inventory|shop|store|buy|sell|orders

DETECT INTEGRATIONS:
auth(supabase|clerk)→login|users|signup|accounts|members|authentication
payments(stripe|paddle)→pricing|subscription|pay|checkout|billing|monetize
db(supabase|planetscale)→data|store|save|persist|database [default:supabase]
email(resend|sendgrid)→notifications|newsletter|transactional|contact|emails
ai(openai|anthropic)→chatbot|recommendations|intelligent|ML|AI|generate
analytics(posthog|plausible)→tracking|metrics|insights|analytics|reporting

COMPLEXITY: simple=single-purpose+basic-CRUD|moderate=multi-feature+some-integrations|complex=many-integrations+custom-workflows
ENTITIES: Extract main data models from description (User,Product,Post,Order,etc)

OUTPUT: {category,confidence:0-1,reasoning,suggestedTemplate,features[],integrations:{auth?,payments?,email?,db?,ai?,analytics?},complexity,keyEntities[]}
