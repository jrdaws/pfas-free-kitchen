# Affiliate Setup Checklist – Step-by-Step

Detailed instructions for Amazon, Awin, and CJ Affiliate. Do these now so you're ready when traffic grows.

---

## AMAZON ASSOCIATES

### 1. Set Up Payment Method

**Why:** You won't get paid until this is done. Direct deposit has no fee.

**Steps:**
1. Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com/) and log in
2. Click **Account** in the top navigation
3. Click **Account Settings**
4. Find **Payment Method** section
5. Click **Change Payment Method**
6. Select **Pay Me By Direct Deposit**
7. Choose your country
8. Enter:
   - Bank name
   - Routing number (9 digits)
   - Account number
   - Account type (Checking/Savings)
9. Confirm and save

**Alternative:** Gift Certificate (no bank needed, $10 minimum) – same path, choose "Gift Certificate" instead.

---

### 2. Enable SiteStripe

**Why:** Create affiliate links from any Amazon product page without leaving the site.

**Steps:**
1. Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com/)
2. Click **Tools** in the top menu
3. Click **SiteStripe**
4. If you see "Learn More" – click it first
5. Find the **Display** or **Enable** toggle
6. Turn it **ON**
7. Open a new tab and go to [amazon.com](https://amazon.com)
8. Search for any product and open a product page
9. You should see a thin bar at the **top** of the page with "Get Link" options

**To use:** On any Amazon product page, click "Get Link" in the SiteStripe bar → choose Text, Image, or Text+Image → copy the code.

---

### 3. Create Creators API App & Credentials

**Why:** Get your Access Key and Secret Key ready for PA-API (product images) when you hit 10 sales.

**Steps:**
1. Go to [affiliate-program.amazon.com/creatorsapi](https://affiliate-program.amazon.com/creatorsapi)
2. Click **Create App**
3. Enter app name (e.g. "PFAS Free Kitchen")
4. Click **Add New Credential**
5. **Immediately copy and save:**
   - Access Key (starts with `AKIA...`)
   - Secret Key (shown only once – if you lose it, create a new credential)
6. Store in `src/pfas-web/.env.local`:
   ```
   AMAZON_ACCESS_KEY=your_access_key_here
   AMAZON_SECRET_KEY=your_secret_key_here
   AMAZON_PARTNER_TAG=pfasfreekitch-20
   ```

---

### 4. OneLink (Optional – International Traffic)

**Why:** Sends visitors to the right Amazon store (US, UK, Canada, etc.) automatically.

**Steps:**
1. Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com/)
2. Click **Tools** → **OneLink**
3. Or click the OneLink banner if shown on your dashboard
4. Select marketplaces (Canada, UK, EU5, etc.)
5. For each marketplace, you need an Associates account in that country
6. Enter your Store ID for each (e.g. `pfasfreekitch-20` for US)
7. Click **Link Store** for each
8. Copy the OneLink script and add to your site (replaces individual Amazon links)

**Note:** Only do this if you have or expect international traffic. US-only sites can skip.

---

### 5. Disclosure Text

**Why:** Required by Amazon and FTC.

**Where to add:** Your site footer and near affiliate links.

**Text:** "As an Amazon Associate I earn from qualifying purchases."

**Your site:** Already has this in `EcommerceFooter.tsx` and disclosure pages.

---

## AWIN

### 1. Complete Publisher Profile (100%)

**Why:** Advertisers see this when you apply. Incomplete profiles get rejected. Only 100% complete profiles appear in the directory.

**Steps:**
1. Go to [ui.awin.com](https://ui.awin.com) and log in
2. Click your **profile icon** (top right) or go to **Account**
3. Click **Profile** → **Overview**
4. Complete every section:

   **Profile Image:**
   - Click the image box
   - Upload a professional photo or logo

   **Links:**
   - Website: `https://pfasfreekitchen.com`
   - Blog: (if you have one)
   - Social media: Twitter/X, Instagram, Pinterest, etc.

   **Contact:**
   - Email (required)
   - Phone (optional)

   **Overview (Business Description):**
   - Business type: "PFAS-free product review and recommendation site"
   - How you promote: "Product reviews, category guides, comparison content"
   - Monthly visitors: Your estimate (e.g. "1,000–5,000")
   - Social stats: Follower counts if relevant
   - Active regions: "United States"
   - Click **Generate AI Description** to auto-fill, then edit

   **Documents:**
   - Add media kit or rate card if you have one

   **Advertisers:**
   - List brands you work with or plan to promote

   **Promotional Spaces:**
   - Describe where links appear (homepage, category pages, product pages)

5. Save each section
6. Check for any "Complete your profile" warnings until you see 100%

---

### 2. Install Publisher MasterTag

**Why:** Enables Convert-a-Link, tracking, and other Awin tools on your site.

**Steps:**
1. Log in to [ui.awin.com](https://ui.awin.com)
2. Go to **Account** → **Publisher MasterTag** (or **Tools** → **MasterTag**)
3. Copy the MasterTag script – it looks like:
   ```html
   <script src="https://www.dwin1.com/XXXXX.js"></script>
   ```
4. Add to your site's `<head>` in the root layout

**For Next.js (your site):**
- Add to `src/pfas-web/app/layout.tsx` in the `<head>` section
- Or use `next/script` with `strategy="afterInteractive"`

**Where to find it:** Account → Publisher MasterTag, or search "MasterTag" in Awin help.

---

### 3. Apply to Advertiser Programs

**Why:** You must be approved before you can use their affiliate links. Approval can take days or weeks.

**Steps:**
1. Go to **Advertisers** → **Advertiser Directory** (or **Find Advertisers**)
2. Search for: "Williams Sonoma", "Sur La Table", "GreenPan", "Zwilling", "cookware", "kitchen"
3. Click an advertiser
4. Click **Apply** or **Join Program**
5. Fill out the application (often auto-filled from your profile)
6. Submit
7. Repeat for 5–10 relevant programs

**Programs to try:**
- Williams Sonoma
- Sur La Table
- Bed Bath & Beyond (if on Awin)
- Cookware brands
- Kitchen appliance brands

---

### 4. Link Builder (When Approved)

**Steps:**
1. Go to **Toolbox** → **Link Builder**
2. Or: **Advertisers** → **My Programmes** → click orange **Promote** on any program
3. Select advertiser from dropdown
4. Paste destination URL (e.g. product page URL)
5. Click **Generate Link**
6. Copy the affiliate URL

---

## CJ AFFILIATE

### 1. Add Promotional Property (Your Website)

**Why:** Your Property ID (PID) is required for links. Advertisers see your properties when you apply.

**Steps:**
1. Go to [members.cj.com](https://members.cj.com) and log in
2. Click **Account** in the top navigation
3. Click **Promotional Properties** in the left sidebar
4. Click **Add New Property** or **Add**
5. Fill out the form:

   **Property Type:** Website
   
   **URL:** `https://pfasfreekitchen.com`
   
   **Property Name:** PFAS Free Kitchen (or similar)
   
   **Description:** "PFAS-free product review site. We verify kitchen products for PFAS and recommend trusted alternatives. Content includes product guides, category pages, and comparisons."
   
   **Traffic:** Monthly unique visitors (estimate)
   
   **Promotional Method:** Content/Editorial (select what fits)

6. Submit
7. **Note your Property ID** – it's the number assigned (e.g. 101660610). This is your CJ PID for `affiliate.ts`.

---

### 2. Complete Publisher Profile

**Why:** Advertisers review this when you apply. Incomplete profiles get rejected.

**Steps:**
1. Go to **Account** → **Publisher Information** (or **Profile**)
2. Write a **250+ character description** including:
   - What your site does
   - How you promote (content, reviews, comparisons)
   - Your audience
   - Traffic sources
3. Add all websites you promote on
4. Add promotional channels (organic search, social, email, etc.)
5. Add traffic details

**Example description (250+ chars):**
"PFAS Free Kitchen is a product review site focused on verified PFAS-free kitchen products. We publish product guides, category comparisons, and buyer's guides. Our audience seeks cookware, bakeware, and storage solutions free from harmful chemicals. We promote through organic search, social media, and email. Monthly traffic: 1,000–5,000 visitors."

---

### 3. Apply to Advertiser Programs

**Why:** You must be approved before using their links. Apply now; approvals take 1–2 days to several weeks.

**Steps:**
1. Go to **Advertisers** → **Advertiser Search** (or **Find Advertisers**)
2. Search: "Williams Sonoma", "Sur La Table", "cookware", "kitchen", "Bed Bath"
3. Click an advertiser
4. Click **Apply to Program** or **Join**
5. Select your **Promotional Property** (pfasfreekitchen.com)
6. Submit application
7. Repeat for 5–10 programs

**Programs to try:**
- Williams Sonoma
- Sur La Table
- Bed Bath & Beyond
- Macy's
- Wayfair
- Cookware brands

---

### 4. Deep Link Generator (Bookmarklet)

**Why:** Create affiliate links from any product page on advertiser sites.

**Steps:**
1. Go to [junction.cj.com/article/deep-linking-tools-publishers](https://junction.cj.com/article/deep-linking-tools-publishers)
2. Find the **"CJ Deep Link Generator"** button
3. **Drag** the button to your browser's bookmarks toolbar (don't click)
4. Visit an advertiser's product page (e.g. williams-sonoma.com)
5. Click the bookmark in your toolbar
6. A popup with the affiliate link appears – copy it

**Note:** You must be approved for that advertiser first.

---

## PRIORITY ORDER

| Order | Task | Time |
|-------|------|------|
| 1 | Amazon: Payment method | 5 min |
| 2 | Amazon: SiteStripe | 2 min |
| 3 | Amazon: Creators API credentials | 5 min |
| 4 | CJ: Promotional property | 10 min |
| 5 | CJ: Publisher profile 250+ chars | 10 min |
| 6 | Awin: Complete profile 100% | 15 min |
| 7 | Awin: MasterTag on site | 5 min |
| 8 | CJ & Awin: Apply to 5+ programs each | 20 min |

**Total:** ~1.5 hours

---

## QUICK REFERENCE

**Amazon:** [affiliate-program.amazon.com](https://affiliate-program.amazon.com)  
**Awin:** [ui.awin.com](https://ui.awin.com)  
**CJ:** [members.cj.com](https://members.cj.com)

**Your IDs:**
- Amazon tag: `pfasfreekitch-20`
- CJ PID: `101660610`
- Awin Publisher ID: `2764342`
