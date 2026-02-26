# VA Content Management System Setup

This guide walks through setting up the complete VA workflow:

```
Input (Jotform) → Process (Airtable + VA) → Publish (Sanity) → Deploy (Vercel) → Automate (Zapier)
```

## Overview

| Component | Purpose | VA Access Level |
|-----------|---------|-----------------|
| **Jotform** | Product submission form | Submit only |
| **Airtable** | Product staging & tracking | Full access |
| **Sanity** | Content management & publishing | Editor access |
| **Vercel** | Automatic deployment | View only |
| **Zapier** | Automation between tools | Admin only |
| **Notion** | Documentation & SOPs | Full access |
| **Slack** | Communication | Full access |

---

## Step 1: Create Sanity Project

### 1.1 Sign Up for Sanity

1. Go to [sanity.io](https://www.sanity.io)
2. Sign up with GitHub or email
3. Create a new project named "pfas-free-kitchen"
4. Select "Production" dataset
5. Note your **Project ID** (you'll need this)

### 1.2 Deploy Sanity Studio

From the project root:

```bash
cd sanity
npm install
```

Add your Project ID to `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

Deploy the studio:

```bash
npm run deploy
```

Your studio will be available at: `https://your-project.sanity.studio`

### 1.3 Add Initial Data

1. Open Sanity Studio
2. Create categories first:
   - Cookware → Fry Pans, Dutch Ovens, Sauce Pans, Cutting Boards
   - Bakeware → Baking Dishes, Baking Sheets
   - Food Storage → Glass Containers, Stainless Containers
   - Appliances → Blenders, Coffee Makers, Air Fryers, etc.
3. Create brands (Lodge, GreenPan, Vitamix, etc.)
4. Then add products

---

## Step 2: Create Airtable Base

### 2.1 Sign Up for Airtable

1. Go to [airtable.com](https://www.airtable.com)
2. Sign up (free tier is sufficient to start)
3. Create a new base named "PFAS-Free Kitchen Products"

### 2.2 Create Tables

#### Table 1: Product Submissions

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Product Name | Single line text | Required |
| Brand | Single line text | |
| Amazon URL | URL | |
| ASIN | Single line text | Extracted from URL |
| Category | Single select | Cookware, Bakeware, Storage, Appliances |
| Subcategory | Single line text | |
| Price | Currency | USD |
| Material | Single line text | e.g., "Cast iron", "Borosilicate glass" |
| Coating | Single line text | e.g., "Ceramic", "None" |
| PFAS Evidence | Long text | Links to lab tests, certifications |
| PFAS Score | Number | 1-10 |
| Status | Single select | New, Researching, Verified, Published, Rejected |
| VA Notes | Long text | |
| Submitted By | Single line text | |
| Submitted Date | Date | Auto-filled |
| Published Date | Date | |

#### Table 2: Research Queue

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Product | Link to Products | |
| Research Task | Single select | Verify PFAS, Check Price, Find Better Link |
| Priority | Single select | High, Medium, Low |
| Assigned To | Single line text | VA name |
| Due Date | Date | |
| Status | Single select | Todo, In Progress, Done |
| Notes | Long text | |

#### Table 3: Brand Registry

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Brand Name | Single line text | Required |
| Website | URL | |
| PFAS Policy | Long text | |
| Trust Level | Single select | High, Medium, Low, Avoid |
| Products | Link to Products | |
| Last Verified | Date | |

### 2.3 Create Views

1. **New Submissions** - Filter: Status = "New"
2. **VA Research Queue** - Filter: Status = "Researching"
3. **Ready to Publish** - Filter: Status = "Verified"
4. **Published Products** - Filter: Status = "Published"

---

## Step 3: Create Jotform

### 3.1 Sign Up for Jotform

1. Go to [jotform.com](https://www.jotform.com)
2. Sign up (free tier allows 5 forms)
3. Create a new form: "PFAS-Free Product Submission"

### 3.2 Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Product Name | Text | Yes | |
| Amazon URL | Website | Yes | Full product URL |
| Brand | Text | Yes | |
| Category | Dropdown | Yes | Cookware, Bakeware, Storage, Appliances |
| Subcategory | Text | No | Specific type (e.g., "Fry Pan") |
| Approximate Price | Number | No | |
| Primary Material | Text | No | What is it made of? |
| Does it have a coating? | Radio | No | Yes/No |
| Coating Type | Text | Conditional | If yes, what type? |
| Why is this PFAS-free? | Long Text | Yes | Evidence links, certifications |
| Additional Notes | Long Text | No | |
| Your Name | Text | Yes | For tracking |

### 3.3 Form Settings

1. Enable email notifications (notify admin on submission)
2. Enable submission confirmation (thank you message)
3. Set up redirect to success page

---

## Step 4: Set Up Zapier Automations

### 4.1 Sign Up for Zapier

1. Go to [zapier.com](https://www.zapier.com)
2. Sign up (free tier allows 5 zaps)

### 4.2 Zap 1: Jotform → Airtable

**Trigger:** New Jotform Submission
**Action:** Create Airtable Record

Mapping:
| Jotform Field | Airtable Field |
|---------------|----------------|
| Product Name | Product Name |
| Amazon URL | Amazon URL |
| Brand | Brand |
| Category | Category |
| Subcategory | Subcategory |
| Approximate Price | Price |
| Primary Material | Material |
| Coating Type | Coating |
| Why PFAS-free | PFAS Evidence |
| Your Name | Submitted By |
| (auto) | Status = "New" |

### 4.3 Zap 2: Airtable → Slack Notification

**Trigger:** New Airtable Record (Status = "New")
**Action:** Send Slack Message

Message template:
```
🆕 New Product Submission!
Product: {{Product Name}}
Brand: {{Brand}}
Category: {{Category}}
Submitted by: {{Submitted By}}

👉 Review in Airtable: [link]
```

### 4.4 Zap 3: Airtable → Sanity (Advanced)

**Trigger:** Airtable Record Updated (Status changed to "Verified")
**Action:** Webhook to custom endpoint

This requires a webhook endpoint that:
1. Receives the Airtable data
2. Transforms it to Sanity format
3. Creates/updates the Sanity document

---

## Step 5: VA Workflows

### Daily VA Tasks

#### Morning (30 min)
1. Check Slack for messages
2. Review Airtable "New Submissions" view
3. Move items to "Researching" status

#### Research Phase (Main work)
For each product in "Researching":

1. **Extract ASIN from Amazon URL**
   - URL format: `amazon.com/dp/XXXXXXXXXX`
   - The 10-character code after `/dp/` is the ASIN

2. **Verify product exists and is available**
   - Open Amazon link
   - Confirm product is in stock
   - Note current price

3. **Research PFAS status**
   - Check brand website for PFAS policy
   - Search for lab test results
   - Look for certifications (Made Safe, etc.)
   - Check Mamavation, Consumer Reports

4. **Assign PFAS Score (1-10)**
   Use this scoring guide:
   - 🔬 Lab tested PFAS-free: +2 points
   - 🏅 Third-party certified: +2 points
   - 📰 Independent testing (Mamavation etc.): +2 points
   - ✓ Brand states PFAS-free: +1 point
   - 🔗 Supply chain verified: +1 point
   - ⚗️ Inherently PFAS-free material: +2 points

5. **Update Airtable record**
   - Fill in ASIN
   - Update price
   - Add PFAS Score
   - Add research notes
   - Change status to "Verified" (if score ≥ 6)
   - Change status to "Rejected" (if score < 6)

#### Publishing Phase
For "Verified" products:

1. Open Sanity Studio
2. Create new Product document
3. Fill in all fields from Airtable
4. Set status to "Draft"
5. Request review (Slack message to admin)
6. After approval, change to "Published"

### Weekly VA Tasks

1. **Price updates** - Check prices on published products
2. **Stock check** - Verify products still available
3. **New product research** - Find new PFAS-free products
4. **Brand monitoring** - Check for brand policy changes

---

## Step 6: Notion Documentation

### Create Notion Workspace

1. Go to [notion.so](https://www.notion.so)
2. Create workspace: "PFAS-Free Kitchen VA Hub"

### Pages to Create

1. **Home** - Welcome, quick links
2. **SOPs** - All standard operating procedures
3. **Product Research Guide** - How to verify PFAS status
4. **Tool Guides** - How to use each platform
5. **FAQ** - Common questions and answers
6. **Meeting Notes** - Weekly sync notes

### Share with VA

1. Add VA as workspace member
2. Set appropriate permissions (Can Edit)

---

## Step 7: Slack Setup

### Create Slack Workspace

1. Go to [slack.com](https://slack.com)
2. Create workspace or use existing
3. Create channels:
   - `#pfas-products` - Product discussions
   - `#va-tasks` - Task assignments
   - `#questions` - VA questions

### Slack Integrations

1. Add Zapier app for automation notifications
2. Add Airtable app for quick record access
3. Pin important links (Sanity, Airtable, Notion)

---

## Quick Reference Card

### Daily Checklist

- [ ] Check Slack
- [ ] Review new submissions
- [ ] Research 5-10 products
- [ ] Publish verified products
- [ ] Update task status

### Links

| Tool | URL | Purpose |
|------|-----|---------|
| Airtable | airtable.com/[your-base] | Product tracking |
| Sanity | [project].sanity.studio | CMS |
| Jotform | jotform.com/[your-form] | Submissions |
| Notion | notion.so/[workspace] | Documentation |
| Slack | [workspace].slack.com | Communication |
| Website | pfas-free.kitchen | Live site |

### PFAS Score Quick Guide

| Score | Meaning | Action |
|-------|---------|--------|
| 9-10 | Highly verified | Publish with confidence |
| 7-8 | Well verified | Publish |
| 6 | Minimally verified | Publish with note |
| 1-5 | Insufficient evidence | Reject |

### Status Flow

```
New → Researching → Verified → Published
                 ↘ Rejected
```
