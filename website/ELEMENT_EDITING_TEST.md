# Element Editing Indicators Test Guide

## 🎯 What We're Testing

Visual indicators that show which user is currently editing each element in the collaborative editor.

## ✅ Servers Status

- ✅ Collaboration Server: ws://localhost:1234/collaborate (PID: 64614)
- ✅ Next.js Dev Server: http://localhost:3000 (PID: 65942)

## 🚀 Quick Test (5 minutes)

### Step 1: Setup Window 1 (Primary)

1. **Open Browser**: http://localhost:3000
2. **Open DevTools**: Press F12 (keep Console tab visible)
3. **Configure Project**:
   - Template: Any (e.g., "SaaS")
   - Project Name: **"indicator-test"** (IMPORTANT: remember this!)
   - Click "Next" through other steps
4. **Reach AI Preview**: Step 6
5. **Generate Preview**: Click "Generate Preview" (or skip if already generated)
6. **Enter Edit Mode**: Click "Edit Mode" button
7. **Verify Connection**: Top bar should show "🟢 Live"

### Step 2: Setup Window 2 (Secondary)

1. **Open NEW Browser Window**:
   - Use Cmd+N for new window, OR
   - Use Cmd+Shift+N for Incognito mode (recommended)
2. **Navigate**: http://localhost:3000
3. **Open DevTools**: Press F12
4. **Configure SAME Project**:
   - Template: Same as Window 1
   - Project Name: **"indicator-test"** (MUST MATCH!)
   - Click through steps
5. **Enter Edit Mode**: Go to AI Preview → Edit Mode
6. **Verify Multi-User**: Top bar should show "🟢 Live · 1 user online"
7. **Verify Avatar**: You should see another user's colored avatar circle

### Step 3: Test Element Editing Indicators 🎨

**Window 1 Actions:**
```
1. Click on a HEADING element (h1, h2, etc.)
2. Element gets blue selection outline
3. Console logs: "🎯 [CollaborativeEditor] User selected element: element-X"
```

**Window 2 - Watch For:**
```
✅ A COLORED BORDER appears around the same heading
✅ USER BADGE appears above the element with:
   - User's name
   - Edit icon (pencil)
   - Colored background matching user's color
✅ PULSING DOTS at all four corners of the element
✅ SUBTLE OVERLAY (10% opacity) with user's color
```

**Window 2 Actions:**
```
1. Now click a DIFFERENT element (e.g., a paragraph or button)
2. Element gets blue selection outline
```

**Window 1 - Watch For:**
```
✅ The indicator on your heading DISAPPEARS (you deselected it)
✅ New indicator appears on the element Window 2 just selected
✅ Shows Window 2's user name and color
```

### Step 4: Test Multiple Selections Simultaneously

**Both Windows:**
```
- Window 1: Select a heading
- Window 2: Select a paragraph
- Both indicators should be visible simultaneously
- Each shows the correct user's name and color
```

### Step 5: Test Dynamic Updates

**Window 1:**
```
1. Click element A (e.g., heading)
2. Wait 2 seconds - indicator appears in Window 2
3. Click element B (e.g., button)
4. Indicator in Window 2 should MOVE from A to B
5. Should happen within 500ms
```

## 🎨 Visual Reference

### What You Should See:

```
┌────────────────────────────────────┐
│ [Edit Icon] User Name              │ ← User Badge (colored)
└─┬──────────────────────────────────┘
  ├─────────────────────────────────┐
● │  Selected Element Content       │ ● ← Pulsing dots
  │                                 │
● │                                 │ ●
  └─────────────────────────────────┘
  ↑                                 ↑
  Colored Border (2px solid)
  Background overlay (10% opacity)
```

### Colors:
- Each user gets a unique color (generated from user ID)
- Examples: #FF6B6B (red), #4ECDC4 (teal), #95E1D3 (mint), etc.
- Colors are consistent per user across sessions

## 📊 Console Logs to Expect

### Window 1 (when selecting element):
```
🎯 [CollaborativeEditor] User selected element: element-5
📝 [CollaborativeEditor] Received HTML update from iframe
```

### Window 2 (when receiving selection):
```
📥 [useCollaborativeHTML] Received remote update
🎯 [CollaborativeEditor] Requesting position for element-5
📥 Received elementPosition response
```

### Iframe (both windows):
```
📤 Sent elementPosition for element-5
```

## ✅ Success Criteria

- [ ] Indicators appear when other users select elements
- [ ] Each indicator shows correct user name
- [ ] Colored border matches user's avatar color
- [ ] Pulsing dots animate at corners
- [ ] User badge displays at top-left of element
- [ ] Indicators update when users change selection
- [ ] Multiple indicators can appear simultaneously
- [ ] No flickering or layout shifts
- [ ] Latency < 500ms
- [ ] No console errors

## ❌ Common Issues

### Issue: Indicators Don't Appear

**Check:**
1. Both windows using same project name?
2. DevTools Console showing any errors?
3. WebSocket connected? (Network tab → WS)
4. Try hard refresh (Cmd+Shift+R)

**Fix:**
```bash
# Restart collaboration server
pkill -f collaboration-server
npm run collab-server
```

### Issue: Wrong Element Highlighted

**Check:**
1. Element IDs matching correctly?
2. Console shows correct elementId?
3. Try selecting different elements

**Fix:**
- Refresh both windows
- Clear localStorage: `localStorage.clear()`

### Issue: Indicators Lag Behind

**Check:**
1. Network latency (ping localhost)
2. Browser throttling (keep windows active)
3. Too many users (test with 2-3 first)

**Expected Latency:**
- Local network: < 100ms
- Selection → Indicator: < 500ms

## 🐛 Debugging Tips

### Enable Verbose Logging

In browser console (either window):
```javascript
// See all awareness updates
localStorage.setItem('debug', 'yjs:*')

// Reload page to enable
location.reload()
```

### Check Awareness State

In browser console:
```javascript
// Get all users' selections
const awareness = window.__yjs_awareness;
if (awareness) {
  const states = Array.from(awareness.getStates().entries());
  console.table(states.map(([id, state]) => ({
    user: state.user?.name,
    selectedElement: state.selectedElement?.elementId,
    cursor: state.cursor
  })));
}
```

### Inspect Element Positions

In browser console (Window with indicator):
```javascript
// Check if indicators are rendering
const indicators = document.querySelectorAll('[class*="absolute pointer-events-none z-40"]');
console.log(`Found ${indicators.length} indicators`);
indicators.forEach(i => console.log(i.style));
```

## 📸 Screenshot Checklist

If filing a bug report, capture:
1. ✅ Both windows side-by-side
2. ✅ DevTools console showing logs
3. ✅ Presence indicator at top (user avatars)
4. ✅ Element with editing indicator visible
5. ✅ Network tab showing WebSocket connection

## 🎉 Expected Outcome

After testing:
- **Visual Confirmation**: You should clearly see who's editing what
- **Real-Time Updates**: Indicators appear/move as users select elements
- **No Conflicts**: Multiple users can work simultaneously without confusion
- **Professional UX**: Smooth animations, clear visual hierarchy

## 🚀 Advanced Testing (Optional)

### Test 3+ Users:
1. Open 3-4 browser windows
2. Each selects a different element
3. All indicators should be visible simultaneously
4. Each with unique color and user name

### Test Rapid Selection Changes:
1. Window 1: Quickly click through 5-6 elements
2. Window 2: Indicators should update smoothly
3. No flickering or lag

### Test Edge Cases:
- Select element at top of page (badge should be visible)
- Select element at bottom (scroll behavior)
- Select very small element (indicator still visible)
- Select very large element (indicator scales correctly)

## 📞 Report Results

After testing, report:
✅ **What Worked**: Which indicators appeared correctly?
❌ **What Failed**: Any indicators missing or incorrect?
⚠️ **Issues Found**: Any console errors or visual glitches?
📊 **Performance**: Latency measurements (if available)

---

**Ready to test!** Follow steps 1-5 above and report your findings. 🎯
