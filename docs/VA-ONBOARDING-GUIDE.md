# VA Onboarding Guide - PFAS-Free Kitchen

Welcome to the PFAS-Free Kitchen team! This guide will help you get started.

---

## Day 1: Getting Access

### Accounts You'll Need

| Tool | Purpose | Access Link |
|------|---------|-------------|
| Slack | Communication | Invitation sent to email |
| Airtable | Product tracking | Invitation sent to email |
| Sanity | Content publishing | Invitation sent to email |
| Notion | Documentation | Invitation sent to email |
| Jotform | View submissions | Link shared in Slack |

### First Steps

1. ✅ Accept all workspace invitations
2. ✅ Set up Slack profile (photo, name, timezone)
3. ✅ Read this entire guide
4. ✅ Bookmark important links
5. ✅ Say hello in #general

---

## Day 2-3: Learning the Tools

### Airtable Training (30 min)

**Video Resources:**
- [Airtable Basics](https://www.youtube.com/watch?v=hDbpNURjDrs) (10 min)
- [Using Views and Filters](https://www.youtube.com/watch?v=_i-v4VQVNBw) (8 min)

**Practice Tasks:**
1. Open the "PFAS-Free Kitchen Products" base
2. Switch between different views (New, Research Queue, Published)
3. Create a test record (we'll delete it later)
4. Edit a field value
5. Use the search function

### Sanity Training (30 min)

**Video Resources:**
- [Sanity Studio Overview](https://www.youtube.com/watch?v=bDVAQZVeebw) (12 min)

**Practice Tasks:**
1. Log into Sanity Studio
2. Browse existing products
3. Look at how fields are organized
4. View a product in preview mode
5. DON'T publish anything yet - just explore

### Understanding PFAS (1 hour)

Read these resources to understand what we're protecting people from:

1. [What are PFAS?](https://www.epa.gov/pfas/pfas-explained) - EPA Overview
2. [PFAS in Cookware](https://www.mamavation.com/food/pfas-free-cookware.html) - Mamavation
3. Our verification methodology: `docs/VA-SYSTEM-SETUP.md`

---

## Your Daily Workflow

### Morning Routine (15 min)

```
1. Check Slack for messages
2. Open Airtable → "New Submissions" view
3. Note how many products need research
4. Plan your day
```

### Main Work: Product Research

For each product in "Researching" status:

#### Step 1: Open the Product

1. Click on the product row in Airtable
2. Open the Amazon URL in a new tab
3. Have a notepad ready

#### Step 2: Verify Product Exists

- Is the product available?
- Is it the NEW version (not "Renewed")?
- What's the current price?

#### Step 3: Extract ASIN

The ASIN is in the Amazon URL:
```
https://www.amazon.com/dp/B00006JSUA
                         ^^^^^^^^^^
                         This is the ASIN
```

Copy this 10-character code to Airtable.

#### Step 4: Research PFAS Status

Check these sources (in order):

1. **Brand Website**
   - Search: "[Brand name] PFAS policy"
   - Look for: "PFAS-free", "PFOA-free", "PTFE-free"
   - Screenshot any statements

2. **Product Materials**
   - What is it made of?
   - Does it have a coating?
   - Is the material inherently PFAS-free?

3. **Independent Testing**
   - Search: "[Product name] Mamavation"
   - Search: "[Product name] Consumer Reports PFAS"
   - Search: "[Brand name] lab test PFAS"

4. **Certifications**
   - Made Safe certified?
   - Other certifications?

#### Step 5: Calculate PFAS Score

Use this scoring system:

| Evidence Type | Points | How to Verify |
|---------------|--------|---------------|
| 🔬 Lab Tested | +2 | Lab report URL |
| 🏅 Third-Party Certified | +2 | Certification logo/link |
| 📰 Independent Testing | +2 | Article/report link |
| ✓ Brand Statement | +1 | Brand website screenshot |
| 🔗 Supply Chain Verified | +1 | Supply chain docs |
| ⚗️ Inherently PFAS-Free | +2 | Material type |

**Score Guide:**
- 8-10: Highly verified ✅
- 6-7: Adequately verified ✅
- 1-5: Insufficient - REJECT ❌

#### Step 6: Update Airtable

1. Fill in ASIN
2. Update price
3. Check relevant evidence boxes
4. Enter PFAS Score
5. Add notes about what you found
6. Update Status:
   - "Verified" if score ≥ 6
   - "Rejected" if score < 6
   - "Needs Review" if unsure

#### Step 7: Move to Next Product

Repeat for all products in queue.

### Publishing to Sanity

When products are "Verified" in Airtable:

1. Open Sanity Studio
2. Click "+ Create" → Product
3. Fill in ALL fields from Airtable:
   - Name (exactly as on Amazon)
   - Brand (select from dropdown)
   - Category (select from dropdown)
   - Description (copy from Amazon)
   - ASIN
   - Price
   - Materials
   - Verification info
4. Set status to "Draft"
5. Post in Slack: "Product [name] ready for review"
6. Wait for approval
7. Change status to "Published"
8. Update Airtable: Status = "Published", add Sanity ID

---

## Materials Quick Reference

### Inherently PFAS-Free (Auto +2 points)

These materials NEVER contain PFAS:
- Cast iron (seasoned or enameled)
- Carbon steel
- Stainless steel
- Borosilicate glass
- Ceramic (traditional pottery)
- Wood (teak, acacia, maple, bamboo)
- Silicone (food-grade)
- Titanium
- Copper
- Natural rubber

### Needs Verification

These CAN be PFAS-free but need evidence:
- Ceramic non-stick coatings (some are, some aren't)
- "PFOA-free" products (may still contain other PFAS)
- Plastic containers (Tritan is safe, others vary)
- Any "non-stick" claim

### Avoid / Reject

- Teflon (PTFE) - contains PFAS
- Unknown coatings without certification
- "PFOA-free" with no PFAS-free claim
- Products with unclear materials

---

## Common Questions

### "What if I can't find PFAS information?"

1. Search the brand + PFAS
2. Check if material is inherently PFAS-free
3. If still unsure, mark as "Needs Review" and ask in Slack

### "What if the product is discontinued?"

1. Mark as "Rejected"
2. Add note: "Product no longer available"
3. Find an alternative if possible

### "What if the price changed?"

Just update the price in Airtable. Price changes don't affect PFAS status.

### "What if I make a mistake?"

1. Don't panic - everything is reversible
2. Fix it if you can
3. Ask for help in Slack if needed

---

## Weekly Tasks

### Friday Checklist

- [ ] All new submissions processed
- [ ] Verified products published to Sanity
- [ ] Update Activity Log in Airtable
- [ ] Post weekly summary in Slack

### Monthly Tasks

- [ ] Price check on 20 random published products
- [ ] Check for out-of-stock products
- [ ] Review rejected products (maybe new evidence?)

---

## Getting Help

### Slack Channels

| Channel | Use For |
|---------|---------|
| #general | Announcements, general chat |
| #va-tasks | Task questions, blockers |
| #pfas-products | Product discussions |
| #questions | Any questions |

### Response Times

- Urgent: Same day
- Normal: Within 24 hours
- FYI: When convenient

### Escalation

If stuck for more than 30 minutes:
1. Post in #questions with details
2. Include what you tried
3. Tag @admin if urgent

---

## Quick Links

| Resource | Link |
|----------|------|
| Airtable Base | [Link shared in Slack] |
| Sanity Studio | [Link shared in Slack] |
| Notion Docs | [Link shared in Slack] |
| Product Research File | `/data/pfas-free-products-research.md` |
| VA Guide | `/docs/VA-PRODUCT-UPDATE-GUIDE.md` |
| System Setup | `/docs/VA-SYSTEM-SETUP.md` |

---

## Your First Week Goals

| Day | Goal |
|-----|------|
| 1 | Access all tools, read guides |
| 2 | Complete Airtable & Sanity training |
| 3 | Research 5 products with supervision |
| 4 | Research 10 products independently |
| 5 | Publish 3 products to Sanity |

Welcome aboard! 🎉
