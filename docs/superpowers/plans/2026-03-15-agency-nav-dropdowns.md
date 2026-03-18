# Agency Nav Dropdowns Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three functional dropdown panels (Messages, Notifications, User) in the agency dashboard navigation bar, replacing the current non-functional icon shells.

**Architecture:** Each dropdown is an extracted component under `client/src/components/agency/nav/`. `AgencyLayout.jsx` holds a single `openPanel` state and a stable `closePanel` callback — only one panel can be open at a time. Mock data is seeded as module-level constants in `AgencyLayout.jsx` with `// TODO` comments for future API wiring.

**Tech Stack:** React 19, React Router v7 (`<Link>`), TanStack Query v5 (already wired — no new queries in this task), Lucide React icons, plain CSS with `agency-tokens.css` custom properties.

> **Note on testing:** This codebase has no frontend component test framework (Jest+Supertest is backend-only). All verification steps are browser-based. Run `npm run dev:all` to start the dev server at `http://localhost:5173` and open the agency dashboard to verify.

---

## Chunk 1: Foundation — CSS Cleanup + AgencyLayout Refactor

---

### Task 1: Remove dead CSS and fix token values in AgencyLayout.css

**Files:**
- Modify: `client/src/layouts/AgencyLayout.css:200-350`

- [ ] **Step 1: Delete the six old user-dropdown CSS blocks**

In `client/src/layouts/AgencyLayout.css`, remove lines 303–350 (the entire block from `.ag-user-dropdown` through the end of `.ag-dropdown-divider`). These classes move to `UserDropdown.css` in Task 9.

The lines to remove:
```css
/* DELETE ALL OF THIS — lines 303–350 */
.ag-user-dropdown { ... }
@keyframes ag-dropdown-in { ... }
.ag-dropdown-item { ... }
.ag-dropdown-item:hover { ... }
.ag-dropdown-item--danger:hover { ... }
.ag-dropdown-divider { ... }
```

- [ ] **Step 2: Fix three raw hex values to use CSS variables**

Still in `AgencyLayout.css`, make these three targeted replacements:

```css
/* Line ~204 — .ag-icon-badge background */
/* BEFORE: */ background: #C9A55A;
/* AFTER:  */ background: var(--ag-gold);

/* Line ~254 — .ag-bell-dot background */
/* BEFORE: */ background: #C9A55A;
/* AFTER:  */ background: var(--ag-gold);

/* Line ~244 — .ag-topbar-icon:hover svg stroke */
/* BEFORE: */ stroke: #C9A84C !important;
/* AFTER:  */ stroke: var(--ag-gold) !important;
```

- [ ] **Step 3: Commit**

```bash
git add client/src/layouts/AgencyLayout.css
git commit -m "refactor: remove dead dropdown CSS, fix icon token values to use --ag-gold"
```

---

### Task 2: Refactor AgencyLayout.jsx state management

**Files:**
- Modify: `client/src/layouts/AgencyLayout.jsx`

- [ ] **Step 1: Update imports**

Replace the top of `AgencyLayout.jsx` (the import block) with:

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  MessageSquare
} from 'lucide-react';
import { getAgencyProfile } from '../api/agency';
import './AgencyLayout.css';
```

Changes from original:
- Add `useCallback` to the React import
- Remove `User` from lucide (no longer used in AgencyLayout)
- Remove `getDueRemindersCount` from the agency import

- [ ] **Step 2: Add mock data constants above the component (outside the function)**

Paste these constants immediately before `export default function AgencyLayout()`:

```js
// TODO: replace MOCK_THREADS with useQuery(['agency', 'messages', 'threads'], fetchThreads)
// Future endpoint: GET /api/agency/messages/threads
const MOCK_THREADS = [
  {
    id: 'thread-1',
    senderName: 'Maya Torres',
    senderAvatar: null,
    applicationLabel: 'Application #42 · Vogue Editorial',
    preview: 'Thanks for getting back to me so quickly!',
    timestamp: '2026-03-15T10:30:00Z',
    unread: true,
  },
  {
    id: 'thread-2',
    senderName: 'James Park',
    senderAvatar: null,
    applicationLabel: 'Application #38 · Harper\'s Bazaar',
    preview: 'I\'ve updated my portfolio as requested.',
    timestamp: '2026-03-14T16:45:00Z',
    unread: true,
  },
  {
    id: 'thread-3',
    senderName: 'Sofia Reyes',
    senderAvatar: null,
    applicationLabel: 'Application #31 · Dior Campaign',
    preview: 'Looking forward to hearing from you.',
    timestamp: '2026-03-13T09:20:00Z',
    unread: false,
  },
];

// TODO: replace MOCK_NOTIFICATIONS with useQuery(['agency', 'notifications'], fetchNotifications)
// Future endpoint: GET /api/agency/notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'application',
    title: 'New application received',
    detail: 'Maya Torres applied for Vogue Editorial',
    timestamp: '2026-03-15T10:30:00Z',
    unread: true,
  },
  {
    id: 'notif-2',
    type: 'interview',
    title: 'Interview scheduled',
    detail: 'James Park — Tuesday 18 March at 2:00 PM',
    timestamp: '2026-03-14T14:00:00Z',
    unread: true,
  },
  {
    id: 'notif-3',
    type: 'reminder',
    title: 'Reminder due today',
    detail: 'Follow up with Zara Studio re: placement',
    timestamp: '2026-03-15T09:00:00Z',
    unread: false,
  },
  {
    id: 'notif-4',
    type: 'placement',
    title: 'Placement confirmed',
    detail: 'Sofia Reyes — Dior Campaign · March 2026',
    timestamp: '2026-03-12T11:30:00Z',
    unread: false,
  },
];
```

- [ ] **Step 3: Replace state/refs/effects inside the component**

Inside `AgencyLayout()`, replace:
```js
// OLD — remove these lines:
const [userMenuOpen, setUserMenuOpen] = useState(false);
const location = useLocation();
const menuRef = useRef(null);
// ...
const { data: dueReminders } = useQuery({ queryKey: ['due-reminders-count'], ... });
// ...
useEffect(() => { setUserMenuOpen(false); }, [location.pathname]);
useEffect(() => {
  const handler = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);
const notifCount = (dueReminders?.count ?? 0) || 3;
```

With:
```js
// NEW
const [openPanel, setOpenPanel] = useState(null); // 'messages' | 'notifications' | 'user' | null
const location = useLocation();

// Wrapper refs (for outside-click detection)
const messagesRef = useRef(null);
const notificationsRef = useRef(null);
const userRef = useRef(null);

// Trigger button refs (for focus-return on close)
const messagesBtnRef = useRef(null);
const notificationsBtnRef = useRef(null);
const userBtnRef = useRef(null);

// Stable close function — empty deps because setOpenPanel and btn refs are stable
const closePanel = useCallback((panelName) => {
  setOpenPanel(null);
  if (panelName === 'messages') messagesBtnRef.current?.focus();
  else if (panelName === 'notifications') notificationsBtnRef.current?.focus();
  else if (panelName === 'user') userBtnRef.current?.focus();
}, []);

// Ref so the outside-click handler (stable, [] deps) can read the current openPanel
// without capturing a stale closure value
const openPanelRef = useRef(null);
useEffect(() => { openPanelRef.current = openPanel; }, [openPanel]);

// Close on outside click — calls closePanel so focus is restored to the trigger
useEffect(() => {
  const handler = (e) => {
    const outside =
      !messagesRef.current?.contains(e.target) &&
      !notificationsRef.current?.contains(e.target) &&
      !userRef.current?.contains(e.target);
    if (outside && openPanelRef.current) closePanel(openPanelRef.current);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, [closePanel]);

// Close on route change
useEffect(() => { setOpenPanel(null); }, [location.pathname]);

// Close on Escape (with focus restore)
useEffect(() => {
  const handler = (e) => {
    if (e.key === 'Escape' && openPanel) closePanel(openPanel);
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [openPanel, closePanel]);

// Track whether the user has clicked "Mark all read" inside each panel.
// Because the panel components unmount on close (resetting their internal readIds),
// we lift this boolean to AgencyLayout so the nav badge/dot stays cleared on reopen.
// For mock phase this is acceptable — a real API would return updated data from the server.
const [msgsAllRead, setMsgsAllRead] = useState(false);
const [notifsAllRead, setNotifsAllRead] = useState(false);

// Derived badge counts
const unreadMessages = msgsAllRead ? 0 : MOCK_THREADS.filter(t => t.unread).length;
const hasUnreadNotifications = !notifsAllRead && MOCK_NOTIFICATIONS.some(n => n.unread);
```

- [ ] **Step 4: Replace the right action bar JSX**

In the JSX, replace the entire "Right — Actions + User" section (from `<div className="ag-topbar-right">` inward) with:

```jsx
{/* Right — Actions + User */}
<div className="ag-topbar-right">
  <button className="ag-topbar-icon" aria-label="Search">
    <Search size={18} />
  </button>

  {/* Messages */}
  <div ref={messagesRef} style={{ position: 'relative' }}>
    <button
      ref={messagesBtnRef}
      className="ag-topbar-icon"
      aria-label="Messages"
      aria-expanded={openPanel === 'messages'}
      aria-haspopup="true"
      onClick={() => setOpenPanel(p => p === 'messages' ? null : 'messages')}
    >
      <MessageSquare size={18} />
      {unreadMessages > 0 && <span className="ag-icon-badge">{unreadMessages}</span>}
    </button>
    {/* MessagesDropdown wired in Task 5 */}
  </div>

  {/* Notifications */}
  <div ref={notificationsRef} style={{ position: 'relative' }}>
    <button
      ref={notificationsBtnRef}
      className="ag-topbar-icon ag-topbar-icon--bell"
      aria-label="Notifications"
      aria-expanded={openPanel === 'notifications'}
      aria-haspopup="true"
      onClick={() => setOpenPanel(p => p === 'notifications' ? null : 'notifications')}
    >
      <Bell size={18} />
      {hasUnreadNotifications && <span className="ag-bell-dot" />}
    </button>
    {/* NotificationsDropdown wired in Task 8 */}
  </div>

  <Link to="/dashboard/agency/settings" className="ag-topbar-icon" aria-label="Settings">
    <Settings size={18} />
  </Link>

  {/* Separator */}
  <div className="ag-topbar-sep" />

  {/* User menu */}
  <div ref={userRef} style={{ position: 'relative' }} className="ag-user-menu">
    <button
      ref={userBtnRef}
      className="ag-user-trigger"
      aria-expanded={openPanel === 'user'}
      aria-haspopup="true"
      onClick={() => setOpenPanel(p => p === 'user' ? null : 'user')}
    >
      <img src={userImg} alt={userName} className="ag-user-avatar" />
      <span className="ag-user-name">{userName}</span>
      <ChevronDown
        size={14}
        className={`ag-user-chevron ${openPanel === 'user' ? 'ag-user-chevron--open' : ''}`}
      />
    </button>
    {/* UserDropdown wired in Task 11 */}
  </div>
</div>
```

Note: The old `{userMenuOpen && <div className="ag-user-dropdown">...</div>}` block inside `.ag-user-menu` is removed entirely. Also confirm that `ref={menuRef}` has been removed from `.ag-user-menu` (it no longer exists — the div now uses `ref={userRef}`).

- [ ] **Step 5: Verify in browser**

```bash
npm run dev:all
```

Open `http://localhost:5173/dashboard/agency`. Confirm:
- Nav bar renders without errors (no console errors)
- Messages icon shows badge "2" (2 unread mock threads)
- Bell shows a gold dot (2 unread mock notifications)
- Clicking messages/bell/user trigger does nothing visible yet (no panels wired) — that's expected
- Clicking a different nav route (e.g. Discover) and back works fine
- No console errors about undefined variables

- [ ] **Step 6: Commit**

```bash
git add client/src/layouts/AgencyLayout.jsx
git commit -m "refactor: replace userMenuOpen with openPanel state, add mock data + closePanel"
```

---

## Chunk 2: MessagesDropdown Component

---

### Task 3: Create MessagesDropdown CSS

**Files:**
- Create: `client/src/components/agency/nav/MessagesDropdown.css`

- [ ] **Step 1: Create the CSS file**

Create `client/src/components/agency/nav/MessagesDropdown.css` with:

```css
/* ── MessagesDropdown ─────────────────────────────────── */

@keyframes nav-panel-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

.nav-panel {
  animation: nav-panel-in 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.md-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  width: 380px;
  max-height: 480px;
  background: var(--ag-surface-0);
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.md-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--ag-border);
  flex-shrink: 0;
}

.md-title {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ag-text-0);
  margin: 0;
}

.md-mark-read {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ag-gold);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s ease;
}

.md-mark-read:hover {
  opacity: 0.75;
}

/* ── List ── */
.md-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* ── Thread item ── */
.md-thread {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px 10px 20px; /* left padding leaves room for unread dot */
  position: relative;
  border-bottom: 1px solid var(--ag-border);
  cursor: pointer;
  transition: background 0.15s ease;
  text-decoration: none;
  color: inherit;
}

.md-thread:last-child {
  border-bottom: none;
}

.md-thread:hover,
.md-thread--unread {
  background: var(--ag-surface-3);
}

.md-unread-dot {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ag-gold);
  flex-shrink: 0;
}

/* ── Avatar ── */
.md-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.md-avatar-initials {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ag-gold-muted);
  color: var(--ag-gold);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Thread content ── */
.md-thread-body {
  flex: 1;
  min-width: 0;
}

.md-thread-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.md-sender {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--ag-text-0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.md-thread--unread .md-sender {
  font-weight: 600;
}

.md-timestamp {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--ag-text-3);
  white-space: nowrap;
  flex-shrink: 0;
}

.md-context,
.md-preview {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ag-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  line-height: 1.4;
}

.md-preview {
  font-size: 13px;
  margin-top: 1px;
}

/* ── States ── */
.md-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  color: var(--ag-text-2);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
}

.md-skeleton-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ag-border);
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--ag-surface-3) 25%,
    var(--ag-surface-4) 50%,
    var(--ag-surface-3) 75%
  );
  background-size: 200%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.md-skel-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.md-skel-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.md-skel-line {
  height: 10px;
}

.md-skel-line--wide  { width: 80%; }
.md-skel-line--short { width: 60%; }

/* ── Footer ── */
.md-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--ag-border);
  text-align: center;
  flex-shrink: 0;
}

.md-footer a {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ag-gold);
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.md-footer a:hover {
  opacity: 0.75;
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/agency/nav/MessagesDropdown.css
git commit -m "feat: add MessagesDropdown CSS"
```

---

### Task 4: Create MessagesDropdown component

**Files:**
- Create: `client/src/components/agency/nav/MessagesDropdown.jsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/agency/nav/MessagesDropdown.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import './MessagesDropdown.css';

/** Returns initials from a full name, e.g. "Maya Torres" → "MT" */
function getInitials(name) {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Formats an ISO timestamp as a relative string: "2h ago", "1d ago", etc. */
function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function MessagesDropdown({
  isOpen,
  onClose,
  threads,
  onAllRead,
  isLoading = false,
  isError = false,
}) {
  // readIds tracks which thread ids have been locally marked as read within this mount.
  // Note: resets on panel close/reopen (unmount) — acceptable for mock phase.
  // The nav badge count is cleared via onAllRead() which updates parent state.
  const [readIds, setReadIds] = useState(new Set());
  const firstItemRef = useRef(null);

  // Move focus into panel when it opens
  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnread = (t) => t.unread && !readIds.has(t.id);
  const anyUnread = threads.some(isUnread);

  const markAllRead = () => {
    // TODO: call PATCH /api/agency/messages/read-all then invalidate ['agency','messages','threads'] query
    setReadIds(new Set(threads.map(t => t.id)));
    onAllRead?.(); // clears the nav badge in the parent
  };

  return (
    <div className="nav-panel md-panel" aria-label="Messages">
      {/* Header */}
      <div className="md-header">
        <p className="md-title">Messages</p>
        {anyUnread && (
          <button className="md-mark-read" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="md-list">
        {isLoading && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="md-skeleton-row">
                <div className="skeleton md-skel-circle" />
                <div className="md-skel-lines">
                  <div className="skeleton md-skel-line md-skel-line--wide" />
                  <div className="skeleton md-skel-line md-skel-line--short" />
                </div>
              </div>
            ))}
          </>
        )}

        {isError && (
          <div className="md-state">Couldn't load messages</div>
        )}

        {!isLoading && !isError && threads.length === 0 && (
          <div className="md-state">
            <Mail size={32} color="var(--ag-text-3)" />
            No messages yet
          </div>
        )}

        {!isLoading && !isError && threads.map((thread, idx) => {
          const unread = isUnread(thread);
          return (
            <Link
              key={thread.id}
              to="/dashboard/agency/messages"
              className={`md-thread${unread ? ' md-thread--unread' : ''}`}
              onClick={onClose}
              ref={idx === 0 ? firstItemRef : null}
            >
              {unread && <span className="md-unread-dot" aria-hidden="true" />}

              {thread.senderAvatar ? (
                <img
                  src={thread.senderAvatar}
                  alt={thread.senderName}
                  className="md-avatar"
                />
              ) : (
                <div className="md-avatar-initials" aria-hidden="true">
                  {getInitials(thread.senderName)}
                </div>
              )}

              <div className="md-thread-body">
                <div className="md-thread-top">
                  <span className="md-sender">{thread.senderName}</span>
                  <span className="md-timestamp">{relativeTime(thread.timestamp)}</span>
                </div>
                <p className="md-context">{thread.applicationLabel}</p>
                <p className="md-preview">{thread.preview}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="md-footer">
        <Link to="/dashboard/agency/messages" onClick={onClose}>
          Open full inbox →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/agency/nav/MessagesDropdown.jsx
git commit -m "feat: add MessagesDropdown component"
```

---

### Task 5: Wire MessagesDropdown into AgencyLayout

**Files:**
- Modify: `client/src/layouts/AgencyLayout.jsx`

- [ ] **Step 1: Add the import**

At the top of `AgencyLayout.jsx`, add:
```js
import MessagesDropdown from '../components/agency/nav/MessagesDropdown';
```

- [ ] **Step 2: Replace the placeholder comment with the real component**

Inside the messages wrapper div, replace `{/* MessagesDropdown wired in Task 5 */}` with:

```jsx
<MessagesDropdown
  isOpen={openPanel === 'messages'}
  onClose={() => closePanel('messages')}
  threads={MOCK_THREADS}
  onAllRead={() => setMsgsAllRead(true)}
  isLoading={false}
  isError={false}
/>
```

- [ ] **Step 3: Verify overflow clipping**

```bash
npm run dev:all
```

Open `http://localhost:5173/dashboard/agency`. Click the messages icon. **Verify:**
- The panel appears fully below the nav bar (not clipped)
- 3 thread items are visible, 2 with gold unread dot + surface-3 tint
- Avatar initials show in gold circle
- Timestamps show relative format
- "Mark all read" button appears (2 unread threads)

**If the panel is visually clipped** (cut off at the nav bar edge):
1. In `AgencyLayout.css`, find the `.ag-topbar` block and add `overflow: visible;`
2. If still clipped, also add `overflow: visible;` to `.ag-topbar-right`
3. If still clipped, switch `MessagesDropdown.css` `.md-panel` to `position: fixed` and add a `getBoundingClientRect()` calculation for positioning (unlikely needed — verify first)

- [ ] **Step 4: Verify mark all read**

Click "Mark all read". Confirm:
- Badge on nav icon disappears
- Unread dots on thread items disappear
- Threads lose the `--ag-surface-3` background tint
- "Mark all read" button disappears from header

- [ ] **Step 5: Verify close behaviours**

- Click a thread item → navigates to `/dashboard/agency/messages`, panel closes
- Click outside the panel → panel closes, focus returns to messages button
- Press Escape → panel closes, focus returns to messages button
- Open messages, click notifications icon → messages closes, notifications would open (placeholder for now)

- [ ] **Step 6: Commit**

```bash
git add client/src/layouts/AgencyLayout.jsx
git commit -m "feat: wire MessagesDropdown into AgencyLayout"
```

---

## Chunk 3: NotificationsDropdown Component

---

### Task 6: Create NotificationsDropdown CSS

**Files:**
- Create: `client/src/components/agency/nav/NotificationsDropdown.css`

- [ ] **Step 1: Create the CSS file**

Create `client/src/components/agency/nav/NotificationsDropdown.css`:

```css
/* ── NotificationsDropdown ────────────────────────────── */

@keyframes nav-panel-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

.nav-panel {
  animation: nav-panel-in 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.nd-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  width: 360px;
  max-height: 460px;
  background: var(--ag-surface-0);
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.nd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--ag-border);
  flex-shrink: 0;
}

.nd-title {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ag-text-0);
  margin: 0;
}

.nd-mark-read {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ag-gold);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s ease;
}

.nd-mark-read:hover {
  opacity: 0.75;
}

/* ── List ── */
.nd-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* ── Notification item ── */
.nd-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ag-border);
  cursor: default;
  transition: background 0.15s ease;
}

.nd-item:last-child {
  border-bottom: none;
}

.nd-item--unread {
  background: var(--ag-surface-3);
}

/* ── Icon circle ── */
.nd-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ── Item content ── */
.nd-item-body {
  flex: 1;
  min-width: 0;
}

.nd-item-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.nd-item-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--ag-text-0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nd-item--unread .nd-item-title {
  font-weight: 600;
}

.nd-item-time {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--ag-text-3);
  white-space: nowrap;
  flex-shrink: 0;
}

.nd-item-detail {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ag-text-2);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── States ── */
.nd-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  color: var(--ag-text-2);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
}

.nd-skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ag-border);
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--ag-surface-3) 25%,
    var(--ag-surface-4) 50%,
    var(--ag-surface-3) 75%
  );
  background-size: 200%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.nd-skel-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.nd-skel-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nd-skel-line { height: 10px; }
.nd-skel-line--wide  { width: 75%; }
.nd-skel-line--short { width: 55%; }

/* ── Footer ── */
.nd-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--ag-border);
  text-align: center;
  flex-shrink: 0;
}

.nd-footer a {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ag-gold);
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.nd-footer a:hover {
  opacity: 0.75;
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/agency/nav/NotificationsDropdown.css
git commit -m "feat: add NotificationsDropdown CSS"
```

---

### Task 7: Create NotificationsDropdown component

**Files:**
- Create: `client/src/components/agency/nav/NotificationsDropdown.jsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/agency/nav/NotificationsDropdown.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, UserPlus, Calendar, Clock, CheckCircle } from 'lucide-react';
import './NotificationsDropdown.css';

function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

const TYPE_CONFIG = {
  application: { icon: UserPlus,     color: 'var(--ag-gold)'    },
  interview:   { icon: Calendar,     color: 'var(--ag-info)'    },
  reminder:    { icon: Clock,        color: 'var(--ag-warning)' },
  placement:   { icon: CheckCircle,  color: 'var(--ag-success)' },
};

export default function NotificationsDropdown({
  isOpen,
  onClose,
  notifications,
  onAllRead,
  isLoading = false,
  isError = false,
}) {
  // readIds tracks locally-read items within this mount.
  // Resets on close/reopen (unmount) — acceptable for mock phase.
  // Bell dot is cleared via onAllRead() which updates parent state.
  const [readIds, setReadIds] = useState(new Set());
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnread = (n) => n.unread && !readIds.has(n.id);
  const anyUnread = notifications.some(isUnread);

  const markAllRead = () => {
    // TODO: call PATCH /api/agency/notifications/read-all then invalidate ['agency','notifications'] query
    setReadIds(new Set(notifications.map(n => n.id)));
    onAllRead?.(); // clears the bell dot in the parent
  };

  return (
    <div className="nav-panel nd-panel" aria-label="Notifications">
      {/* Header */}
      <div className="nd-header">
        <p className="nd-title">Notifications</p>
        {anyUnread && (
          <button className="nd-mark-read" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="nd-list">
        {isLoading && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="nd-skeleton-row">
                <div className="skeleton nd-skel-circle" />
                <div className="nd-skel-lines">
                  <div className="skeleton nd-skel-line nd-skel-line--wide" />
                  <div className="skeleton nd-skel-line nd-skel-line--short" />
                </div>
              </div>
            ))}
          </>
        )}

        {isError && (
          <div className="nd-state">Couldn't load notifications</div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="nd-state">
            <Bell size={32} color="var(--ag-text-3)" />
            You're all caught up
          </div>
        )}

        {!isLoading && !isError && notifications.map((notif, idx) => {
          const unread = isUnread(notif);
          const { icon: Icon, color } = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.application;

          return (
            {/* tabIndex={0} allows Tab focus and Escape-to-close to work.
                Notification items have no click action (read-only feed) — intentional per spec.
                A future iteration may add per-item navigation to the relevant page. */}
            <div
              key={notif.id}
              className={`nd-item${unread ? ' nd-item--unread' : ''}`}
              ref={idx === 0 ? firstItemRef : null}
              tabIndex={0}
            >
              <div className="nd-icon-circle" style={{ background: color }}>
                <Icon size={16} color="#ffffff" />
              </div>
              <div className="nd-item-body">
                <div className="nd-item-top">
                  <span className="nd-item-title">{notif.title}</span>
                  <span className="nd-item-time">{relativeTime(notif.timestamp)}</span>
                </div>
                <p className="nd-item-detail">{notif.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="nd-footer">
        <Link to="/dashboard/agency/activity" onClick={onClose}>
          View all activity →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/agency/nav/NotificationsDropdown.jsx
git commit -m "feat: add NotificationsDropdown component"
```

---

### Task 8: Wire NotificationsDropdown into AgencyLayout

**Files:**
- Modify: `client/src/layouts/AgencyLayout.jsx`

- [ ] **Step 1: Add the import**

```js
import NotificationsDropdown from '../components/agency/nav/NotificationsDropdown';
```

- [ ] **Step 2: Replace the placeholder comment**

Inside the notifications wrapper div, replace `{/* NotificationsDropdown wired in Task 8 */}` with:

```jsx
<NotificationsDropdown
  isOpen={openPanel === 'notifications'}
  onClose={() => closePanel('notifications')}
  notifications={MOCK_NOTIFICATIONS}
  onAllRead={() => setNotifsAllRead(true)}
  isLoading={false}
  isError={false}
/>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/dashboard/agency`. Click the bell icon. **Verify:**
- Panel appears with 4 notification items
- Items 1 and 2 have `--ag-surface-3` tint (unread)
- Icon circles: item 1 = gold (application), item 2 = blue (interview), item 3 = amber (reminder), item 4 = green (placement)
- All icons are white on their circle background
- "Mark all read" appears (2 unread)
- Bell dot on nav icon disappears after "Mark all read"
- Click outside → closes, focus returns to bell button
- Press Escape → closes, focus returns to bell button
- Opening messages then bell → messages closes, bell opens (mutual exclusivity)

- [ ] **Step 4: Commit**

```bash
git add client/src/layouts/AgencyLayout.jsx
git commit -m "feat: wire NotificationsDropdown into AgencyLayout"
```

---

## Chunk 4: UserDropdown Component

---

### Task 9: Create UserDropdown CSS

**Files:**
- Create: `client/src/components/agency/nav/UserDropdown.css`

- [ ] **Step 1: Create the CSS file**

Create `client/src/components/agency/nav/UserDropdown.css`:

```css
/* ── UserDropdown ─────────────────────────────────────── */

@keyframes nav-panel-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.nav-panel {
  animation: nav-panel-in 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.ud-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  width: 280px;
  background: var(--ag-surface-0);
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

/* ── Profile card ── */
.ud-profile {
  padding: 16px;
  background: var(--ag-surface-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.ud-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.ud-avatar-initials {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--ag-gold-muted);
  color: var(--ag-gold);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ud-name {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ag-text-0);
  margin: 0;
  line-height: 1.3;
}

.ud-agency {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ag-text-2);
  margin: 0;
}

.ud-badge {
  display: inline-block;
  border: 1px solid var(--ag-gold);
  color: var(--ag-gold);
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: transparent;
  padding: 2px 8px;
  border-radius: 100px;
  margin-top: 2px;
}

/* ── Divider ── */
.ud-divider {
  height: 1px;
  background: var(--ag-border);
  margin: 0;
}

/* ── Nav links ── */
.ud-nav {
  padding: 6px 0;
}

.ud-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ag-text-1);
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
  cursor: pointer;
}

.ud-item:hover {
  background: var(--ag-surface-3);
}

.ud-item:hover .ud-item-icon {
  color: var(--ag-gold);
}

.ud-item-icon {
  color: var(--ag-text-2);
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.ud-item-label {
  flex: 1;
}

.ud-external-icon {
  color: var(--ag-text-3);
  flex-shrink: 0;
}

/* ── Logout ── */
.ud-item--logout {
  color: var(--ag-text-1);
}

.ud-item--logout:hover {
  background: transparent; /* no bg change on logout hover */
  color: var(--ag-danger);
}

.ud-item--logout:hover .ud-item-icon {
  color: var(--ag-danger);
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/agency/nav/UserDropdown.css
git commit -m "feat: add UserDropdown CSS"
```

---

### Task 10: Create UserDropdown component

**Files:**
- Create: `client/src/components/agency/nav/UserDropdown.jsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/agency/nav/UserDropdown.jsx`:

```jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Receipt,
  Users,
  HelpCircle,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import './UserDropdown.css';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UserDropdown({ isOpen, onClose, profile }) {
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const firstName = profile?.first_name || 'Agency User';
  const agencyName = profile?.agency_name || '';
  const avatarUrl = profile?.images?.[0]?.path
    ? `/${profile.images[0].path}`
    : null;

  const navLinks = [
    { label: 'Settings',          icon: Settings,   to: '/dashboard/agency/settings',  external: false },
    { label: 'Billing & Invoices', icon: Receipt,    to: '/dashboard/agency/billing',   external: false },
    { label: 'Team Members',       icon: Users,      to: '/dashboard/agency/team',      external: false },
  ];

  return (
    <div className="nav-panel ud-panel" aria-label="Account menu">
      {/* Profile card */}
      <div className="ud-profile">
        {avatarUrl ? (
          <img src={avatarUrl} alt={firstName} className="ud-avatar" />
        ) : (
          <div className="ud-avatar-initials" aria-hidden="true">
            {getInitials(firstName)}
          </div>
        )}
        <p className="ud-name">{firstName}</p>
        {agencyName && <p className="ud-agency">{agencyName}</p>}
        <span className="ud-badge">Enterprise</span>
      </div>

      <div className="ud-divider" />

      {/* Nav links */}
      <nav className="ud-nav">
        {navLinks.map(({ label, icon: Icon, to }, idx) => (
          <Link
            key={label}
            to={to}
            className="ud-item"
            onClick={onClose}
            ref={idx === 0 ? firstItemRef : null}
          >
            <Icon size={16} className="ud-item-icon" />
            <span className="ud-item-label">{label}</span>
          </Link>
        ))}

        {/* Help & Support — external */}
        <a
          href="mailto:support@pholio.studio"
          target="_blank"
          rel="noopener noreferrer"
          className="ud-item"
        >
          <HelpCircle size={16} className="ud-item-icon" />
          <span className="ud-item-label">Help & Support</span>
          <ExternalLink size={12} className="ud-external-icon" />
        </a>
      </nav>

      <div className="ud-divider" />

      {/* Logout — hard navigation, matches existing codebase pattern */}
      <a href="/logout" className="ud-item ud-item--logout">
        <LogOut size={16} className="ud-item-icon" />
        <span className="ud-item-label">Log out</span>
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/agency/nav/UserDropdown.jsx
git commit -m "feat: add UserDropdown component"
```

---

### Task 11: Wire UserDropdown into AgencyLayout + final verification

**Files:**
- Modify: `client/src/layouts/AgencyLayout.jsx`

- [ ] **Step 1: Add the import**

```js
import UserDropdown from '../components/agency/nav/UserDropdown';
```

- [ ] **Step 2: Replace the placeholder comment**

Inside the user menu wrapper, replace `{/* UserDropdown wired in Task 10 */}` with:

```jsx
<UserDropdown
  isOpen={openPanel === 'user'}
  onClose={() => closePanel('user')}
  profile={profile}
/>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/dashboard/agency`. Click the user trigger (avatar + name + chevron). **Verify:**

- Panel appears with profile card: initials avatar (if no profile image), first name, agency name, "ENTERPRISE" badge in gold outline pill
- Chevron on the trigger has rotated 180°
- 4 nav links visible: Settings, Billing & Invoices, Team Members, Help & Support
- Help & Support has a small external link icon and opens `mailto:support@pholio.studio`
- Log out link at the bottom
- Hovering a nav link: `--ag-surface-3` background + icon turns gold
- Hovering Log out: text and icon turn `--ag-danger` red, no background change
- Clicking Settings closes the dropdown and navigates to settings
- Clicking outside closes the dropdown, focus returns to the user trigger button
- Pressing Escape closes the dropdown, focus returns to the user trigger button

- [ ] **Step 4: Cross-panel mutual exclusivity check**

- Open messages → click bell → messages closes, notifications opens ✓
- Open notifications → click user trigger → notifications closes, user opens ✓
- Open user → click messages → user closes, messages opens ✓
- Open any panel → click a nav link → panel closes, route changes ✓

- [ ] **Step 5: Discover page check**

Navigate to `/dashboard/agency/discover`. Open any panel. **Verify:**
- The warm cream panel (`#FAF8F5`) renders visibly against the dark cosmic background
- Panel is not blending in with the dark background (it should contrast clearly)
- Overflow/clipping works the same as on other pages

- [ ] **Step 6: Commit**

```bash
git add client/src/layouts/AgencyLayout.jsx
git commit -m "feat: wire UserDropdown into AgencyLayout, complete nav dropdowns"
```
