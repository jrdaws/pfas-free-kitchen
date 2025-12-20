# 🧪 Configurator Testing Guide

## 📍 Current Status

**Phase 2 Core Flow: COMPLETE** ✅

### What's Built:
- ✅ 8-step navigation system
- ✅ Beginner/Advanced mode toggle
- ✅ 6 production-ready templates
- ✅ Form validation for all inputs
- ✅ 18 integration providers across 7 types
- ✅ CLI command generation
- ✅ State persistence (localStorage)
- ✅ Responsive design (mobile-first)
- ✅ Terminal aesthetic maintained

### What's Skipped (for Phase 3+):
- ⏭️ Step 2: Inspiration Upload
- ⏭️ Step 5: Environment Keys Input
- ⏭️ Step 6: AI Preview & Iteration
- ⏭️ Step 7: Vision/Mission/Goals

---

## 🚀 QUICK START (2 minutes)

### Prerequisites:
```bash
# Ensure dev server is running:
cd website
npm run dev
# Should see: ✓ Ready on http://localhost:3001
```

### Test URL:
**http://localhost:3001/configure**

### Minimal Test Flow:
1. Open browser → Navigate to http://localhost:3001/configure
2. Click **"SaaS Starter"** template
3. Click **"Next"**
4. Type `test-app` in **Project Name**
5. Click **"Next"**
6. Click **"Supabase"** under Auth
7. Click **"Supabase"** under Database
8. Click **"Next"**
9. Click **"Copy Command"**

**Expected Result:** Command copied to clipboard:
```bash
framework export saas ./test-app --auth supabase --db supabase
```

---

## 📋 COMPREHENSIVE TEST CHECKLIST

### Step 1: Template Selection
- [ ] Page loads with "Project Configurator" header
- [ ] Mode toggle shows "Beginner" selected (cyan background)
- [ ] Step indicator shows 8 steps, Step 1 active (cyan)
- [ ] 6 template cards visible with icons
- [ ] Hover on cards shows scale animation
- [ ] Clicking template adds cyan border + checkmark
- [ ] "Next" button disabled initially
- [ ] "Next" button enabled after selection
- [ ] "Previous" button disabled (first step)

### Step 2: Project Details
- [ ] Shows "Project Details" heading
- [ ] Project Name input field exists
- [ ] Output Directory input pre-filled with `./my-app`
- [ ] Typing updates slug preview in real-time
- [ ] Invalid names show red error with AlertCircle icon
- [ ] Valid names show preview box with full path
- [ ] "Next" button disabled for invalid input
- [ ] "Next" button enabled for valid input
- [ ] "Previous" button enabled, goes back to Step 1

### Step 3: Integrations
- [ ] Shows "Select Integrations" heading
- [ ] Required integrations marked with asterisk
- [ ] Warning shows if required missing (red box)
- [ ] Integration cards show provider name + description
- [ ] Beginner mode shows "Recommended" badges
- [ ] Advanced mode hides "Recommended" badges
- [ ] Clicking toggles selection (cyan border + checkmark)
- [ ] Selected integrations summary appears at bottom
- [ ] "Next" button disabled if required missing
- [ ] "Next" button enabled when requirements met

### Step 4: Export
- [ ] Shows "Export Your Project" heading
- [ ] Configuration summary shows all selections
- [ ] CLI command displays with line breaks
- [ ] "Copy Command" button exists (cyan)
- [ ] Clicking copy shows "Copied!" with checkmark
- [ ] Required env vars section appears
- [ ] Next steps guide shows 4 steps
- [ ] "Start Over" button visible (replaces "Next")

### Navigation
- [ ] Step indicator shows progress (filled circles)
- [ ] Clicking completed steps navigates back
- [ ] Clicking incomplete steps does nothing
- [ ] Validation message shows when proceeding incomplete
- [ ] Mode toggle works at any step
- [ ] Browser back button works

### State Persistence
- [ ] Complete full flow, then refresh (F5)
- [ ] All selections should persist
- [ ] Open DevTools → Application → Local Storage
- [ ] Key "configurator-storage" exists with JSON data
- [ ] Clear storage → resets to defaults

### Mobile Responsive
- [ ] Open DevTools (F12) → Toggle device toolbar
- [ ] Test iPhone SE (375px): Cards stack, readable
- [ ] Test iPad (768px): Grid adjusts, usable
- [ ] Test Desktop (1920px): Full layout
- [ ] Step indicator shows step name on mobile only
- [ ] Navigation buttons accessible on all sizes

---

## 🎯 TEST SCENARIOS

### Scenario 1: SaaS with Multiple Integrations
**Goal:** Test full integration selection

1. Select: SaaS Starter
2. Project: `my-saas-platform`
3. Integrations:
   - Auth: Clerk
   - Payments: Stripe
   - Email: Resend
   - Database: PlanetScale
   - AI: Anthropic
   - Analytics: PostHog
   - Storage: Cloudflare R2

**Expected Command:**
```bash
framework export saas ./my-saas-platform \
  --auth clerk \
  --payments stripe \
  --email resend \
  --db planetscale \
  --ai anthropic \
  --analytics posthog \
  --storage r2
```

**Expected Env Vars:**
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- DATABASE_URL
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_POSTHOG_KEY
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY

### Scenario 2: E-commerce Template
**Goal:** Test required integrations validation

1. Select: E-commerce
2. Note: Requires auth, payments, db (3 required)
3. Try to proceed without selecting → Blocked
4. Select only Auth → Still blocked
5. Select Auth + Payments → Still blocked
6. Select Auth + Payments + Database → Allowed ✅

### Scenario 3: Blog Template (No Requirements)
**Goal:** Test template with optional integrations

1. Select: Blog/CMS
2. Note: No required integrations
3. Can proceed immediately to export
4. Optionally add Analytics
5. Command should work with or without integrations

### Scenario 4: Mode Switching
**Goal:** Test Beginner vs Advanced modes

1. Start in Beginner mode
2. Select SaaS → Proceed to integrations
3. Note: Supabase auth has "Recommended" badge
4. Switch to Advanced mode (top toggle)
5. Note: "Recommended" badges disappear
6. Functionality unchanged, just visual difference

### Scenario 5: Validation Edge Cases
**Goal:** Test input validation

**Invalid Project Names:**
- ` ` (space) → Error
- `-app` → Error (starts with hyphen)
- `app-` → Error (ends with hyphen)
- `my--app` → Error (double hyphen)
- `MY APP` → Auto-converts to `my-app` ✅
- `my_app` → Auto-converts to `my-app` ✅

**Invalid Directories:**
- `myapp` → Error (must start with ./)
- `` (empty) → Error (required)
- `./my-app` → Valid ✅

---

## 🐛 KNOWN ISSUES TO CHECK

### Critical (blocks usage):
- [ ] Console errors on page load
- [ ] Step navigation doesn't work
- [ ] Copy to clipboard fails
- [ ] State doesn't persist on refresh
- [ ] Required integrations not enforced

### Medium (degraded experience):
- [ ] Icons don't render (lucide-react)
- [ ] Animations janky or missing
- [ ] Mobile layout broken
- [ ] Mode toggle doesn't update UI
- [ ] Validation messages unclear

### Low (polish issues):
- [ ] Colors don't match terminal theme
- [ ] Typography inconsistent
- [ ] Button hover states missing
- [ ] Loading states needed
- [ ] Accessibility issues

---

## 📊 SUCCESS CRITERIA

### Must Pass:
1. ✅ Complete flow without errors
2. ✅ CLI command generates correctly
3. ✅ Copy button works
4. ✅ Validation prevents bad input
5. ✅ State persists on refresh

### Should Pass:
6. ✅ Navigation works as expected
7. ✅ Responsive on mobile (375px)
8. ✅ Mode toggle affects UI
9. ✅ No console errors
10. ✅ Terminal aesthetic maintained

---

## 🔧 TROUBLESHOOTING

### Page is blank
```bash
# Check server is running
lsof -ti:3001

# Restart if needed
cd website
npm run dev
```

### Console errors about modules
```bash
# Reinstall dependencies
cd website
rm -rf node_modules package-lock.json
npm install
```

### Hydration errors
```bash
# Clear browser cache
# Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Firefox: Cmd+Shift+Delete
# Safari: Cmd+Option+E
```

### Copy button doesn't work
- Try in Chrome/Edge (best compatibility)
- Ensure using localhost (not 127.0.0.1)
- Check browser permissions for clipboard

### State doesn't persist
- Check browser allows localStorage
- Open DevTools → Application → Local Storage
- Look for "configurator-storage" key
- Try clearing and testing again

---

## 📸 VISUAL VERIFICATION

### Color Palette:
- Background: `#0a0e14` (dark)
- Primary Text: `#00ff41` (green)
- Accent: `#00d9ff` (cyan)
- Dim Text: Green at 60% opacity
- Error: Red
- Warning: Yellow

### Typography:
- Headings: Font Display (system), bold
- Body: System font stack
- Code/CLI: JetBrains Mono (monospace)

### Spacing:
- Page padding: 12px (mobile), increases on larger screens
- Card gaps: 4 (16px)
- Section spacing: 6 (24px)

---

## 🎬 NEXT STEPS AFTER TESTING

### If All Tests Pass:
1. ✅ **Ship it!** Core flow is production-ready
2. Gather user feedback
3. Plan Phase 3 features

### If Issues Found:
1. Document the issue with:
   - What you did (steps to reproduce)
   - What you expected
   - What actually happened
   - Screenshots/console output
2. Check troubleshooting section
3. Report back for fixes

---

## 📞 REPORTING RESULTS

Please provide:
1. **Quick Test Result:** ✅ Passed / ❌ Failed
2. **Issues Found:** List any problems
3. **Browser Used:** Chrome/Firefox/Safari/Other
4. **Device:** Desktop/Mobile/Tablet
5. **Screenshots:** If errors occurred
6. **Console Output:** Any errors from DevTools

---

## ✨ BONUS TESTS

If you want to go deeper:

### Performance:
- [ ] Page loads in < 2 seconds
- [ ] Step transitions are smooth (< 100ms)
- [ ] No layout shift on load

### Accessibility:
- [ ] Tab navigation works
- [ ] Screen reader announces steps
- [ ] Color contrast passes WCAG AA
- [ ] Error messages are clear

### Edge Cases:
- [ ] Very long project names
- [ ] Special characters in names
- [ ] Rapid clicking (race conditions)
- [ ] Multiple browser tabs (state sync)

---

**Ready to test?** Open http://localhost:3001/configure and let me know how it goes!
