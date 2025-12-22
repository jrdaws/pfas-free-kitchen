# Real-Time HTML Sync Testing Guide

## 🚀 Server Status

Both servers are running and ready:
- ✅ **Collaboration Server**: ws://localhost:1234/collaborate
- ✅ **Next.js Dev Server**: http://localhost:3000

## 📋 Multi-Window Testing Checklist

### Setup Phase (5 minutes)

#### Window 1: Primary Editor
```
1. Open browser: http://localhost:3000
2. Open DevTools Console (F12) - Keep this open to see logs
3. Configure project:
   - Template: SaaS (or any template)
   - Project Name: "test-collab"
   - Skip through other steps (click Next)
4. Reach Step 6: AI Preview
5. Click "Generate Preview" or skip
6. Click "Edit Mode" button
7. ✅ Verify: Green "🟢 Live" indicator at top
```

#### Window 2: Secondary Editor
```
1. Open NEW browser window (Cmd+N) or Incognito (Cmd+Shift+N)
2. Navigate to: http://localhost:3000
3. Open DevTools Console (F12)
4. Configure SAME project:
   - Template: SaaS (same as Window 1)
   - Project Name: "test-collab" (MUST MATCH!)
   - Skip through steps
5. Go to AI Preview and click "Edit Mode"
6. ✅ Verify: "🟢 Live · 1 user online" indicator
7. ✅ Verify: You see another user's avatar
```

#### Window 3: Third Observer (Optional)
```
1. Open another new window/tab
2. Repeat same steps as Window 2
3. ✅ Verify: "🟢 Live · 2 users online"
4. ✅ Verify: Two user avatars visible
```

---

## 🧪 Test Scenarios

### Test 1: Text Content Synchronization ⭐ CORE TEST

**Window 1:**
```
1. Click any heading or paragraph text
2. Right sidebar shows "Properties Panel"
3. Find "Text Content" field
4. Change text to: "Hello from User 1"
5. Press Enter or click outside
```

**Window 2 - Watch for:**
```
✅ Text updates to "Hello from User 1" INSTANTLY
✅ No page refresh needed
✅ Update happens within 500ms
✅ Console shows: "📥 [useCollaborativeHTML] Received remote update"
```

**Window 3 - Should also show:**
```
✅ Same text "Hello from User 1"
✅ All windows synchronized
```

**Success Criteria:**
- [ ] Text visible in all windows within 1 second
- [ ] No console errors
- [ ] Text exactly matches across all windows

---

### Test 2: Style Synchronization 🎨

**Window 1:**
```
1. Select a heading element (click on it)
2. In Properties Panel, change:
   - Background Color: #FF6B6B (red)
   - Text Color: #FFFFFF (white)
   - Font Size: 32px
   - Padding: 20px
```

**All Other Windows:**
```
✅ Background turns red
✅ Text turns white
✅ Font size increases
✅ Padding adds space
✅ Changes appear smoothly (no flicker)
```

**Console Logs (all windows):**
```
📝 [CollaborativeEditor] Received HTML update from iframe
📤 [useCollaborativeHTML] Sending local update (Window 1 only)
📥 [useCollaborativeHTML] Received remote update (Other windows)
```

**Success Criteria:**
- [ ] All style changes sync to all windows
- [ ] Visual appearance identical across windows
- [ ] No layout shifts or flicker

---

### Test 3: Element Deletion 🗑️

**Window 2:**
```
1. Select any paragraph or button
2. Press Delete key (or use delete button if available)
3. Element should disappear
```

**Window 1 & 3:**
```
✅ Same element disappears instantly
✅ Layout reflows smoothly
✅ No orphaned elements
```

**Success Criteria:**
- [ ] Element removed from all windows
- [ ] No console errors
- [ ] Document structure consistent

---

### Test 4: Concurrent Edits ⚡ ADVANCED TEST

This tests Yjs CRDT conflict resolution:

**Simultaneously (within 2 seconds):**
```
Window 1: Edit heading to "User 1 says hello"
Window 2: Edit SAME heading to "User 2 says hello"
```

**Expected Behavior:**
```
✅ Both edits preserved (Yjs merges them)
✅ Final text contains both: "User 1 says helloUser 2 says hello"
✅ OR: Last complete edit wins (depending on timing)
✅ No data loss
✅ No errors in console
```

**What NOT to expect:**
```
❌ One edit completely overwriting the other
❌ "Conflict" error message
❌ Document corruption
```

**Console Logs:**
```
📤 Sending local update (both windows)
📥 Received remote update (both windows)
🔄 Yjs CRDT merge (automatic, no logs)
```

**Success Criteria:**
- [ ] No errors during concurrent edits
- [ ] Final state is consistent across all windows
- [ ] Both edits visible in some form

---

### Test 5: Late Joiner 👋

**Windows 1 & 2:**
```
1. Make 5-10 different edits:
   - Change text
   - Modify styles
   - Add/remove elements
2. Wait for all changes to sync
```

**Window 4 (NEW):**
```
1. Open fresh browser window
2. Navigate to http://localhost:3000
3. Configure same project: "test-collab"
4. Go to Edit Mode
```

**Expected:**
```
✅ Window 4 loads current document state
✅ Shows all edits from Windows 1 & 2
✅ Brief "Syncing document..." spinner
✅ Loads within 2-3 seconds
✅ Presence shows "3 users online"
```

**Console Logs (Window 4):**
```
✅ [useCollaborativeHTML] Connected to collaboration
🚀 [useCollaborativeHTML] Initializing with initial HTML
📥 [useCollaborativeHTML] Using synced content from server
✅ [useCollaborativeHTML] Received remote update
```

**Success Criteria:**
- [ ] New window gets full current state
- [ ] No edits missing
- [ ] Document identical to existing windows
- [ ] Syncs within 3 seconds

---

### Test 6: Cursor Tracking 🖱️

**All Windows:**
```
1. Move mouse around the editor
2. Watch other windows for cursors
```

**Expected:**
```
✅ See colored cursors for each other user
✅ Cursor shows user name on hover
✅ Cursor moves smoothly (<100ms latency)
✅ Each user has unique color
✅ Cursor disappears when user stops moving
```

**Success Criteria:**
- [ ] All cursors visible and tracking
- [ ] Colors unique per user
- [ ] Labels show correct user names
- [ ] Smooth movement

---

### Test 7: Disconnect/Reconnect 🔌

**Window 1:**
```
1. Stop collaboration server: Go to terminal, press Ctrl+C on collab-server
2. Observe status indicator
3. Try making edit (it queues locally)
4. Restart server: npm run collab-server
5. Watch automatic reconnection
```

**Expected During Disconnect:**
```
🔴 Status changes to "Offline"
⚠️  Edits still work locally
⚠️  But don't sync to other windows
```

**Expected After Reconnection:**
```
✅ Status returns to "🟢 Live"
✅ Queued edits sync immediately
✅ Document state reconciles
✅ No data loss
```

**Console Logs:**
```
⚠️ [useCollaborativeHTML] Disconnected from collaboration
(after restart)
✅ [useCollaborativeHTML] Connected to collaboration
📤 Sending queued updates
```

**Success Criteria:**
- [ ] Disconnect detected within 5 seconds
- [ ] Reconnect happens automatically
- [ ] No data loss during disconnect
- [ ] All edits sync after reconnect

---

## 📊 Performance Benchmarks

### Expected Metrics

| Metric | Target | Acceptable | Poor |
|--------|---------|-----------|------|
| Text sync latency | <300ms | <500ms | >1s |
| Style sync latency | <500ms | <1s | >2s |
| Cursor update rate | 50ms | 100ms | >200ms |
| Late joiner load | <2s | <5s | >10s |
| Concurrent users | 10+ | 5-10 | <5 |

### How to Measure

**Browser DevTools (Network Tab):**
```
1. Filter by "WS" (WebSocket)
2. Click on WebSocket connection
3. Watch "Messages" tab
4. See real-time message flow
```

**Console Timing:**
```javascript
// In browser console, run:
performance.mark('edit-start');
// Make an edit
// Watch console for update log
performance.mark('edit-end');
performance.measure('sync-time', 'edit-start', 'edit-end');
console.log(performance.getEntriesByName('sync-time')[0].duration);
```

---

## ✅ Success Checklist

After completing all tests, verify:

### Functionality
- [ ] Text edits sync across all windows
- [ ] Style changes sync correctly
- [ ] Element operations (delete/duplicate) work
- [ ] Concurrent edits handled gracefully
- [ ] Late joiners receive current state
- [ ] Cursors track in real-time
- [ ] Disconnect/reconnect works

### Performance
- [ ] Sync latency < 500ms
- [ ] No noticeable lag
- [ ] Cursor movement smooth
- [ ] No memory leaks (check DevTools Memory tab)

### User Experience
- [ ] No flickering or jumps
- [ ] Loading states clear
- [ ] Connection status visible
- [ ] Error messages helpful (if any)
- [ ] No data loss in any scenario

### Technical
- [ ] No console errors
- [ ] WebSocket connection stable
- [ ] Yjs operations logged correctly
- [ ] Browser performance good (check FPS)

---

## 🐛 Common Issues & Solutions

### Issue: "Disconnected" Status

**Check:**
```bash
# Is collaboration server running?
ps aux | grep "collaboration-server"

# Restart if needed:
npm run collab-server
```

### Issue: Changes Not Syncing

**Check:**
1. Same project name in all windows?
2. WebSocket connection active? (Network tab → WS)
3. Console errors?

**Fix:**
```
1. Hard refresh all windows (Cmd+Shift+R)
2. Restart collaboration server
3. Clear localStorage: localStorage.clear()
```

### Issue: Cursor Not Visible

**Check:**
1. Users in same project room?
2. Cursor throttle working? (should update every 50ms)
3. Z-index correct? (cursors should be z-50)

### Issue: Update Loops

**Symptom:** Console floods with update messages

**Fix:**
```
1. Check isLocalUpdateRef flag in code
2. Verify 100ms debounce window
3. Restart browser to clear state
```

### Issue: Slow Sync (>2s)

**Possible Causes:**
1. Network latency - check ping
2. Server overload - restart server
3. Browser throttling - keep tabs active
4. Too many users - scale horizontally

---

## 🎯 Testing Tips

1. **Keep Console Open:** Logs show what's happening
2. **Use Incognito:** Separate user sessions clearly
3. **Side-by-Side:** Arrange windows next to each other
4. **Test Methodically:** One scenario at a time
5. **Take Notes:** Document any issues you find
6. **Screen Record:** Capture bugs for debugging

---

## 📸 What Success Looks Like

**Visual Indicators:**
- 🟢 Green "Live" status in all windows
- 👥 User avatars showing all connected users
- 🖱️ Colored cursors moving in real-time
- ⚡ Instant text updates across windows
- 🎨 Synchronized style changes
- 📊 Clean console logs (no errors)

**Console Output (Success):**
```
✅ [useCollaborativeHTML] Connected to collaboration
🚀 [useCollaborativeHTML] Initializing with initial HTML
📤 [useCollaborativeHTML] Sending local update
📥 [useCollaborativeHTML] Received remote update
📝 [CollaborativeEditor] Received HTML update from iframe
```

---

## 🚀 Ready to Test!

1. **Verify servers running:**
   - Collaboration: http://localhost:1234 (should see "Collaboration WebSocket Server")
   - Website: http://localhost:3000

2. **Open multiple windows** (3-5 recommended)

3. **Follow tests sequentially** for best results

4. **Report back** with:
   - Which tests passed ✅
   - Which tests failed ❌
   - Any console errors
   - Screenshots/videos of issues

Happy testing! 🎉
