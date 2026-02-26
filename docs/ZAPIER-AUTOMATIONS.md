# Zapier Automation Setup

## Overview

These automations connect your VA tools:

```
Jotform → Airtable → Slack → Sanity → Vercel
```

---

## Zap 1: Jotform → Airtable

**Purpose:** Automatically create Airtable records when products are submitted

### Setup Steps

1. **Create New Zap**
   - Go to zapier.com → Make a Zap
   - Name it: "Product Submission to Airtable"

2. **Trigger: Jotform**
   - App: Jotform
   - Event: New Submission
   - Account: Connect your Jotform account
   - Form: Select "PFAS-Free Product Submission"

3. **Action: Airtable**
   - App: Airtable
   - Event: Create Record
   - Account: Connect your Airtable account
   - Base: PFAS-Free Kitchen Products
   - Table: Products

4. **Field Mapping:**

   | Jotform Field | Airtable Field |
   |---------------|----------------|
   | productName | Product Name |
   | amazonUrl | Amazon URL |
   | brand | Brand |
   | category | Category |
   | subcategory | Subcategory |
   | approximatePrice | Price |
   | primaryMaterial | Primary Material |
   | coatingType | Coating |
   | evidenceLinks | Evidence Links |
   | additionalNotes | Research Notes |
   | submitterName | Submitted By |

5. **Static Values:**
   - Status: "New"
   - Submitted Date: Use "Zap Meta > Timestamp"

6. **Test & Enable**

---

## Zap 2: New Submission → Slack Alert

**Purpose:** Notify team when new products are submitted

### Setup Steps

1. **Trigger: Airtable**
   - App: Airtable
   - Event: New Record
   - Base: PFAS-Free Kitchen Products
   - Table: Products
   - View: New Submissions (filter: Status = New)

2. **Action: Slack**
   - App: Slack
   - Event: Send Channel Message
   - Channel: #va-tasks

3. **Message Template:**

```
🆕 *New Product Submission*

*Product:* {{Product Name}}
*Brand:* {{Brand}}
*Category:* {{Category}}
*Submitted by:* {{Submitted By}}

👉 Review in Airtable: https://airtable.com/YOUR_BASE_ID

_Submitted {{Submitted Date}}_
```

---

## Zap 3: Verified Product → Slack Notification

**Purpose:** Alert when products are ready for publishing

### Setup Steps

1. **Trigger: Airtable**
   - App: Airtable
   - Event: New or Updated Record
   - Filter: Status = "Verified"

2. **Action: Slack**
   - Channel: #pfas-products

3. **Message Template:**

```
✅ *Product Ready for Publishing*

*Product:* {{Product Name}}
*Brand:* {{Brand}}
*PFAS Score:* {{PFAS Score}}/10

*Evidence:*
- Lab Tested: {{Lab Tested}}
- Certified: {{Third-Party Certified}}
- Independent Test: {{Independent Testing}}

👉 Publish to Sanity now
```

---

## Zap 4: Weekly Summary → Email/Slack

**Purpose:** Weekly progress report

### Setup Steps

1. **Trigger: Schedule**
   - App: Schedule by Zapier
   - Event: Every Week
   - Day: Friday
   - Time: 5:00 PM

2. **Action 1: Airtable - Find Records**
   - Search: Status = "Published" AND Published Date is this week

3. **Action 2: Slack Message**

```
📊 *Weekly PFAS-Free Kitchen Summary*

*Products Published This Week:* {{record_count}}
*Total Products in Database:* [manual count]

*Top Categories:*
1. {{category_1}}
2. {{category_2}}

Keep up the great work! 🎉
```

---

## Zap 5: Airtable → Sanity (Advanced)

**Purpose:** Auto-publish verified products to Sanity

⚠️ **Note:** This requires a custom webhook endpoint or Sanity's official Zapier integration.

### Option A: Using Sanity's Zapier App

1. Install Sanity app in Zapier
2. Connect your Sanity project
3. Map Airtable fields to Sanity fields

### Option B: Custom Webhook

1. **Create Webhook Endpoint** (requires developer)

   Create an API route in your Next.js app:

   ```typescript
   // src/pfas-web/app/api/webhooks/airtable-to-sanity/route.ts
   
   import { sanityClient } from '@/lib/sanity';
   
   export async function POST(request: Request) {
     const data = await request.json();
     
     const sanityDoc = {
       _type: 'product',
       name: data['Product Name'],
       slug: { current: slugify(data['Product Name']) },
       // ... map other fields
     };
     
     await sanityClient.create(sanityDoc);
     
     return Response.json({ success: true });
   }
   ```

2. **Zapier Setup:**
   - Trigger: Airtable record updated (Status = Verified)
   - Action: Webhooks by Zapier → POST
   - URL: https://your-site.vercel.app/api/webhooks/airtable-to-sanity

---

## Zap 6: Price Check Reminder

**Purpose:** Monthly reminder to check product prices

### Setup Steps

1. **Trigger: Schedule**
   - Every Month, 1st day

2. **Action: Airtable - Find Records**
   - Status = "Published"

3. **Action: Slack**

```
📅 *Monthly Price Check Reminder*

Time to verify prices on published products!

Products to check: {{record_count}}

1. Open Airtable → Published view
2. For each product, verify Amazon price
3. Update Price field if changed
4. Note any out-of-stock items

Target: Complete by end of week
```

---

## Free Tier Limits

Zapier free tier includes:
- 5 Zaps (active automations)
- 100 tasks/month (each trigger+action = 1 task)

**Recommended Zaps for Free Tier:**

| Priority | Zap | Tasks/Month Est. |
|----------|-----|------------------|
| 1 | Jotform → Airtable | ~20 |
| 2 | New Submission → Slack | ~20 |
| 3 | Verified → Slack | ~30 |
| 4 | Weekly Summary | 4 |
| 5 | Monthly Reminder | 1 |

**Total:** ~75 tasks/month (under limit)

---

## Testing Checklist

- [ ] Submit test product via Jotform
- [ ] Verify Airtable record created
- [ ] Verify Slack notification received
- [ ] Change status to "Verified"
- [ ] Verify "Ready to Publish" notification
- [ ] Check weekly summary sends

---

## Troubleshooting

### Zap not triggering?

1. Check Zap is turned ON
2. Verify trigger conditions match
3. Check Airtable view filters
4. Review Zap history for errors

### Data not mapping correctly?

1. Re-test trigger to refresh fields
2. Check field names match exactly
3. Look for special characters

### Slack message formatting issues?

1. Use Slack markdown (not HTML)
2. Test in Zapier's formatter first
3. Check for empty fields (use "Formatter > Default Value")
