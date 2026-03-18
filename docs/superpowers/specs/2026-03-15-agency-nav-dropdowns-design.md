# Agency Dashboard Navigation Dropdowns — Design Spec
**Date:** 2026-03-15
**Scope:** Frontend only — MessagesDropdown, NotificationsDropdown, UserDropdown, AgencyLayout state refactor

---

## Overview

The agency dashboard navigation bar (`AgencyLayout.jsx`) currently has icon button shells for messages, notifications, settings, and a user menu. None have functional dropdowns. This spec covers building three interactive dropdown panels (Messages, Notifications, User) and refactoring the layout's open/close state management.

Settings remains a direct `<Link>` to `/dashboard/agency/settings` — no changes needed.

---

## Architecture

### New Files

```
client/src/components/agency/nav/
  MessagesDropdown.jsx
  MessagesDropdown.css
  NotificationsDropdown.jsx
  NotificationsDropdown.css
  UserDropdown.jsx
  UserDropdown.css
```

### AgencyLayout.jsx — Complete Refactor

**State changes:**
- Remove: `const [userMenuOpen, setUserMenuOpen] = useState(false)` and `menuRef`
- Remove: the `getDueRemindersCount` query (`queryKey: ['due-reminders-count']`) and `notifCount` variable — bell dot is now driven by notification mock data
- Remove: the `getDueRemindersCount` import from `../api/agency`
- Add:
  ```js
  const [openPanel, setOpenPanel] = useState(null)
  // values: 'messages' | 'notifications' | 'user' | null

  const messagesRef = useRef(null)
  const notificationsRef = useRef(null)
  const userRef = useRef(null)
  ```

**Mock data in AgencyLayout (top of file, outside component):**
```js
const MOCK_THREADS = [/* 3–4 items, see MessagesDropdown data shape */]
const MOCK_NOTIFICATIONS = [/* 3–4 items, see NotificationsDropdown data shape */]
```

Derived counts (used for nav badges/dots):
```js
const unreadMessages = MOCK_THREADS.filter(t => t.unread).length
const hasUnreadNotifications = MOCK_NOTIFICATIONS.some(n => n.unread)
```

**Three useEffects to add:**
```js
// 1. Outside click — closes any open panel
useEffect(() => {
  const handler = (e) => {
    const outside =
      !messagesRef.current?.contains(e.target) &&
      !notificationsRef.current?.contains(e.target) &&
      !userRef.current?.contains(e.target)
    if (outside) setOpenPanel(null)
  }
  document.addEventListener('mousedown', handler)
  return () => document.removeEventListener('mousedown', handler)
}, [])

// 2. Route change — close any open panel
useEffect(() => { setOpenPanel(null) }, [location.pathname])
// (replaces existing setUserMenuOpen(false) effect — remove old one)

// 3. Escape key
useEffect(() => {
  const handler = (e) => { if (e.key === 'Escape') setOpenPanel(null) }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [])
```

**JSX changes in the right action bar:**

Each icon button and its dropdown get a `position: relative` wrapper div with its corresponding ref:

```jsx
{/* Messages */}
<div ref={messagesRef} style={{ position: 'relative' }}>
  <button
    className="ag-topbar-icon"
    aria-label="Messages"
    aria-expanded={openPanel === 'messages'}
    aria-haspopup="true"
    onClick={() => setOpenPanel(p => p === 'messages' ? null : 'messages')}
  >
    <MessageSquare size={18} />
    {unreadMessages > 0 && <span className="ag-icon-badge">{unreadMessages}</span>}
  </button>
  <MessagesDropdown
    isOpen={openPanel === 'messages'}
    onClose={() => closePanel('messages')}
    threads={MOCK_THREADS}
  />
</div>

{/* Notifications */}
<div ref={notificationsRef} style={{ position: 'relative' }}>
  <button
    className="ag-topbar-icon ag-topbar-icon--bell"
    aria-label="Notifications"
    aria-expanded={openPanel === 'notifications'}
    aria-haspopup="true"
    onClick={() => setOpenPanel(p => p === 'notifications' ? null : 'notifications')}
  >
    <Bell size={18} />
    {hasUnreadNotifications && <span className="ag-bell-dot" />}
  </button>
  <NotificationsDropdown
    isOpen={openPanel === 'notifications'}
    onClose={() => closePanel('notifications')}
    notifications={MOCK_NOTIFICATIONS}
  />
</div>

{/* User menu */}
<div ref={userRef} style={{ position: 'relative' }} className="ag-user-menu">
  <button
    className="ag-user-trigger"
    aria-expanded={openPanel === 'user'}
    aria-haspopup="true"
    onClick={() => setOpenPanel(p => p === 'user' ? null : 'user')}
  >
    <img src={userImg} alt={userName} className="ag-user-avatar" />
    <span className="ag-user-name">{userName}</span>
    <ChevronDown size={14} className={`ag-user-chevron ${openPanel === 'user' ? 'ag-user-chevron--open' : ''}`} />
  </button>
  <UserDropdown
    isOpen={openPanel === 'user'}
    onClose={() => closePanel('user')}
    profile={profile}
  />
</div>
```

Remove the old inline `{userMenuOpen && <div className="ag-user-dropdown">...</div>}` block entirely.

**Explicit JSX cleanup:** Also remove the `ref={menuRef}` attribute from the `<div className="ag-user-menu">` element. After removing both the variable declaration and the JSX attribute, no dangling `ref` remains.

**AgencyLayout.css — classes to remove:**
Remove these blocks from `AgencyLayout.css` (they move to `UserDropdown.css`):
- `.ag-user-dropdown` (lines ~303–315)
- `@keyframes ag-dropdown-in` (lines ~317–321)
- `.ag-dropdown-item` (lines ~322–339)
- `.ag-dropdown-item:hover`
- `.ag-dropdown-item--danger:hover`
- `.ag-dropdown-divider` (lines ~346+)

**AgencyLayout.css — token fixes (while touching the file):**
- `.ag-icon-badge` background: change `#C9A55A` → `var(--ag-gold)`
- `.ag-bell-dot` background: change `#C9A55A` → `var(--ag-gold)`
- `.ag-topbar-icon:hover svg` stroke: change `#C9A84C` → `var(--ag-gold)`

### Dropdown Positioning & Stacking

All three dropdowns: `position: absolute; top: calc(100% + 8px); right: 0; z-index: 200`.

**Overflow clipping — verification required before completing implementation:**
`.ag-shell` has `position: relative; overflow: hidden` (AgencyLayout.css line 15). This makes it a clipping ancestor for all `position: absolute` children. The dropdown panels (position: absolute, inside `.ag-topbar`) will be clipped by `.ag-shell` if they extend beyond its painted area.

**Verification step:** After placing the first dropdown, open it in the browser and confirm it renders fully below the topbar. If it appears cut off, apply one of these fixes in order of preference:
1. Add `overflow: visible` to `.ag-topbar` in AgencyLayout.css (if it doesn't already have an overflow rule).
2. If that alone doesn't work, add `overflow: visible` to the `.ag-topbar-right` container.
3. If the above still fails (due to nested overflow contexts), switch dropdown panels from `position: absolute` to `position: fixed`. With `position: fixed`, the panel escapes all overflow contexts. Calculate position using `getBoundingClientRect()` on the trigger button and set `top`/`right` via inline style.

**Stacking context note:** On the Discover page, `.ag-shell--discover .ag-topbar` has `backdrop-filter: blur(16px)` which creates a stacking context. Dropdowns within `.ag-topbar` use `z-index: 200` scoped to that context — this is correct and no special handling is needed.

**Discover page appearance:** Dropdowns render with `background: var(--ag-surface-0)` (`#FAF8F5` warm cream) floating over the dark cosmic canvas. This is intentional — a warm card floating over dark space is a strong visual contrast. No special `.ag-shell--discover` override needed for the dropdown panels themselves.

### Animation (all three components share this pattern)

Define in each component's CSS file:
```css
@keyframes nav-panel-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.nav-panel {
  animation: nav-panel-in 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
```

The root element of each dropdown component gets `className="nav-panel"` plus a component-specific class (e.g. `md-panel`, `nd-panel`, `ud-panel`).

Exit animation: none. Panels unmount immediately on `isOpen` becoming false (conditional render). This matches the existing codebase pattern.

### DOM Structure for Scrollable Panels

All three dropdowns use this flex structure to keep header/footer fixed while list scrolls:
```
<div class="nav-panel [component-panel]">        ← container (position: absolute, max-height)
  <div class="[component]-header">…</div>        ← flex-shrink: 0
  <div class="[component]-list">…</div>          ← flex: 1; overflow-y: auto; max-height: (panel max - header - footer)
  <div class="[component]-footer">…</div>        ← flex-shrink: 0
</div>
```
Panel outer uses `display: flex; flex-direction: column`.

### Focus Management

On open: focus moves to the first interactive element inside the panel (first thread item / first notification item / first nav link).

On close (Escape or outside click): focus returns to the trigger button that opened the panel. Each trigger button needs a stable `ref` in AgencyLayout:
```js
const messagesBtnRef = useRef(null)
const notificationsBtnRef = useRef(null)
const userBtnRef = useRef(null)

// useCallback with [] deps is correct: setOpenPanel and the btn refs are all stable references
const closePanel = useCallback((panelName) => {
  setOpenPanel(null)
  if (panelName === 'messages') messagesBtnRef.current?.focus()
  else if (panelName === 'notifications') notificationsBtnRef.current?.focus()
  else if (panelName === 'user') userBtnRef.current?.focus()
}, [])
```

Attach these refs to the trigger `<button>` elements:
```jsx
<button ref={messagesBtnRef} ... onClick={() => setOpenPanel(p => p === 'messages' ? null : 'messages')}>
<button ref={notificationsBtnRef} ... onClick={...}>
<button ref={userBtnRef} ... onClick={...}>  {/* the ag-user-trigger button */}
```

Pass `onClose={() => closePanel('messages')}` (etc.) to each component — **not** `() => setOpenPanel(null)`.

Update the Escape handler to also restore focus:
```js
useEffect(() => {
  const handler = (e) => {
    if (e.key === 'Escape' && openPanel) closePanel(openPanel)
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [openPanel])
```

Note: `closePanel` must be stable (defined with `useCallback` or inside the effect) to avoid stale closure issues in the Escape handler.

Tab key: cycles through items inside the panel naturally (no custom trap needed — these are dropdowns, not modal dialogs).

---

## Data Strategy (Frontend-Only Scope)

No new backend endpoints are in scope. Both MessagesDropdown and NotificationsDropdown use **seeded mock data** defined as constants at the top of `AgencyLayout.jsx`. The data shapes are defined below — components accept data as props and are stateless regarding the source, so a real API can be wired in via `useQuery` without changing the components.

Each mock constant includes a `// TODO: replace with useQuery` comment with the future query key and endpoint.

---

## Component: MessagesDropdown

**Props:** `{ isOpen, onClose, threads, isLoading = false, isError = false }`

For the mock-data phase, AgencyLayout always passes `isLoading={false}` and `isError={false}`. These props exist so a future `useQuery` integration only requires changing the call site in AgencyLayout, not the component interface.

**Dimensions:** Width 380px, max-height 480px outer.

### Data Shape (for MOCK_THREADS)

```js
// TODO: replace with useQuery(['agency', 'messages', 'threads'], fetchThreads)
// Future endpoint: GET /api/agency/messages/threads
[{
  id: 'thread-1',
  senderName: 'Maya Torres',
  senderAvatar: null,           // URL or null → initials fallback
  applicationLabel: 'Application #42 · Vogue Editorial',
  preview: 'Thanks for getting back to me so quickly!',
  timestamp: '2026-03-15T10:30:00Z',  // ISO string
  unread: true
}]
```

### Layout

```
┌─────────────────────────────────┐
│ Messages            Mark all read│  ← 16px h-pad, 14px v-pad
├─────────────────────────────────┤  (1px --ag-border)
│ ● [avatar] Name          2h ago │  ← 12px h-pad, 10px v-pad
│            Application context   │
│            Preview line…         │
├─────────────────────────────────┤
│ [avatar] Name             1d ago │
│          …                       │
├─────────────────────────────────┤  (1px --ag-border)
│        Open full inbox →         │  ← 14px v-pad
└─────────────────────────────────┘
```

### Thread Item Spec

| Element | Spec |
|---------|------|
| Unread dot | 8px circle, `var(--ag-gold)`, `position: absolute; left: 4px`, vertically centered; hidden when `!unread` |
| Avatar | 40px circle; `<img>` if URL, else initials div: `background: var(--ag-gold-muted)`, text `var(--ag-gold)`, Inter 13px semibold |
| Name | Inter 14px, `font-weight: 600` if unread else `500`, `var(--ag-text-0)` |
| Context | Inter 12px, `var(--ag-text-2)`, single-line ellipsis |
| Preview | Inter 13px, `var(--ag-text-2)`, single-line ellipsis |
| Timestamp | Inter 11px, `var(--ag-text-3)`, right-aligned, positioned top-right of the item |

Row states:
- Unread: `background: var(--ag-surface-3)`
- Hover: `background: var(--ag-surface-3)`, `transition: background 0.15s ease`

### Header

- "Messages" — Playfair Display 15px, `var(--ag-text-0)`
- "Mark all read" — Inter 13px, `var(--ag-gold)`; only rendered when `threads.some(t => t.unread)`
- **Mark all read behavior:** Component maintains its own local copy of thread read-state:
  ```js
  const [readIds, setReadIds] = useState(new Set())
  // A thread is "unread" if thread.unread === true AND its id is NOT in readIds
  const isUnread = (t) => t.unread && !readIds.has(t.id)
  // "Mark all read" adds all thread ids to readIds:
  const markAllRead = () => setReadIds(new Set(threads.map(t => t.id)))
  ```
  This approach avoids mutating the prop array and stays correct when the parent re-renders with the same mock data. `// TODO: call PATCH /api/agency/messages/read-all then invalidate ['agency','messages','threads'] query`

### Footer

- "Open full inbox →" — Inter 13px, `var(--ag-gold)`, centered
- `<Link to="/dashboard/agency/messages" onClick={onClose}>`

### Loading State

3 skeleton rows: 40px circle placeholder + two lines at 60% and 80% width. Shimmer via CSS:
```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
.skeleton { background: linear-gradient(90deg, var(--ag-surface-3) 25%, var(--ag-surface-4) 50%, var(--ag-surface-3) 75%); background-size: 200%; animation: shimmer 1.5s infinite; border-radius: 4px; }
```

### Error State

"Couldn't load messages" centered, Inter 13px, `var(--ag-text-2)`. Min-height 80px.

### Empty State

`Mail` icon (32px, `var(--ag-text-3)`) + "No messages yet" (Inter 13px, `var(--ag-text-2)`). Min-height 120px, centered.

### Nav Badge

- Numeric using `.ag-icon-badge`; hidden when `unreadMessages === 0`
- **Intentionally numeric** (not a dot): message count is specific and actionable, distinct from the bell dot which signals existence only

---

## Component: NotificationsDropdown

**Props:** `{ isOpen, onClose, notifications, isLoading = false, isError = false }`

Same prop contract as MessagesDropdown — `isLoading` and `isError` are always `false` for the mock phase. AgencyLayout passes them explicitly.

**Dimensions:** Width 360px, max-height 460px outer.

### Data Shape (for MOCK_NOTIFICATIONS)

```js
// TODO: replace with useQuery(['agency', 'notifications'], fetchNotifications)
// Future endpoint: GET /api/agency/notifications
[{
  id: 'notif-1',
  type: 'application',   // 'application' | 'interview' | 'reminder' | 'placement'
  title: 'New application received',
  detail: 'Maya Torres applied for Vogue Editorial',
  timestamp: '2026-03-15T10:30:00Z',
  unread: true
}]
```

Seed reminder-type entries using the existing `dueReminders` data if available (passed as prop or imported in AgencyLayout). The `getDueRemindersCount` query is removed from AgencyLayout; if a reminder count is needed to seed the mock, hardcode representative mock data instead.

### Notification Item Spec

| Element | Spec |
|---------|------|
| Icon circle | 32px circle; icon 16px white (`#fff`), centered |
| Title | Inter 14px, `font-weight: 600` if unread else `500`, `var(--ag-text-0)` |
| Detail | Inter 12px, `var(--ag-text-2)`, 2 lines max, ellipsis |
| Timestamp | Inter 11px, `var(--ag-text-3)`, right-aligned |

Item padding: 12px horizontal, 10px vertical.
Unread row: `background: var(--ag-surface-3)`.

### Event Type → Icon + Circle Color

| Type | Icon (Lucide) | Circle Color |
|------|---------------|--------------|
| `application` | `UserPlus` | `var(--ag-gold)` |
| `interview` | `Calendar` | `var(--ag-info)` (`#3B7DD8`) |
| `reminder` | `Clock` | `var(--ag-warning)` (`#C2850E`) |
| `placement` | `CheckCircle` | `var(--ag-success)` (`#2D8A56`) |

### Header / Footer

- "Notifications" — Playfair Display 15px, `var(--ag-text-0)`; 16px h-pad, 14px v-pad
- "Mark all read" — conditional on `notifications.some(n => isUnread(n))`. Uses same `readIds` Set pattern as MessagesDropdown (see above). `// TODO: PATCH /api/agency/notifications/read-all`
- Footer: `<Link to="/dashboard/agency/activity" onClick={onClose}>` "View all activity →", Inter 13px, `var(--ag-gold)`, centered, 14px v-pad

### Bell Dot

Shows when `notifications.some(n => n.unread)`. Uses existing `.ag-bell-dot` class (no CSS changes to the dot itself).

### Loading / Error / Empty States

- **Loading:** 3 skeleton rows (32px circle + two lines), same shimmer pattern
- **Error:** "Couldn't load notifications", centered, `var(--ag-text-2)`
- **Empty:** `Bell` icon (32px, `var(--ag-text-3)`) + "You're all caught up" (Inter 13px, `var(--ag-text-2)`)

---

## Component: UserDropdown

**Props:** `{ isOpen, onClose, profile }`

`profile` is the same React Query result already fetched in AgencyLayout (`useQuery(['agency-profile'])`). Pass it directly as a prop — no new query inside this component.

**Dimensions:** Width 280px.

### Profile Card Header

| Element | Spec |
|---------|------|
| Avatar | 48px circle; `<img src={/${profile?.images?.[0]?.path}>` or gold initials fallback (same pattern as trigger) |
| Name | `profile?.first_name || 'Agency User'`; Playfair Display 15px semibold, `var(--ag-text-0)` |
| Agency name | `profile?.agency_name`; Inter 12px, `var(--ag-text-2)` |
| Enterprise badge | Pill: `border: 1px solid var(--ag-gold)`, color `var(--ag-gold)`, 11px uppercase, `letter-spacing: 0.08em`, `background: transparent`, padding `2px 8px`, `border-radius: 100px` |

**Enterprise badge:** Always rendered for agency users — all agency accounts are Enterprise partners. No conditional logic.

Profile card section padding: 16px. Background: `var(--ag-surface-3)`.

### Navigation Links

Padding per item: 10px 16px. Lucide icon: 16px. Gap between icon and label: 10px. Label: Inter 14px, `var(--ag-text-1)`.

Hover: `background: var(--ag-surface-3)`, icon color → `var(--ag-gold)`. Transition: `0.15s ease`.

| Label | Icon | Route / Href | Type |
|-------|------|--------------|------|
| Settings | `Settings` | `/dashboard/agency/settings` | `<Link onClick={onClose}>` |
| Billing & Invoices | `Receipt` | `/dashboard/agency/billing` | `<Link onClick={onClose}>` (placeholder) |
| Team Members | `Users` | `/dashboard/agency/team` | `<Link onClick={onClose}>` (placeholder) |
| Help & Support | `HelpCircle` | `mailto:support@pholio.studio` | `<a href="mailto:..." target="_blank">` + `ExternalLink` 12px suffix icon |

**Removed from old dropdown:** "Analytics" item is deleted. "Sign out" text is renamed to "Log out".

### Dividers

Two `<div className="ud-divider">` elements:
1. After profile card header
2. Before logout

Style: `height: 1px; background: var(--ag-border); margin: 0`

### Logout

```jsx
<a href="/logout" className="ud-item ud-item--logout">
  <LogOut size={16} /> Log out
</a>
```

Hard navigation (`<a>` not `<Link>`) — matches existing codebase pattern. Default color: `var(--ag-text-1)`. Hover: `var(--ag-danger)` text and icon, no background change.

### Chevron (in AgencyLayout trigger, not in this component)

```css
.ag-user-chevron {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.ag-user-chevron--open {
  transform: rotate(180deg);
}
```
This CSS already exists in AgencyLayout.css — no change needed.

---

## Visual Design Tokens (Verified Against agency-tokens.css)

Always reference CSS variables, never raw hex values.

```css
--ag-surface-0: #FAF8F5     /* dropdown panel background */
--ag-surface-3: #F5F2EE     /* hover rows, unread tint, profile card bg */
--ag-surface-4: #EDE9E3     /* pressed/active states */
--ag-gold:      #B8956A     /* accents, badges, dots, links, borders */
--ag-gold-muted: rgba(184,149,106,0.15)  /* avatar initials background */
--ag-text-0:    #1A1815     /* primary headings */
--ag-text-1:    #2D2A26     /* body / interactive links default */
--ag-text-2:    #6B6560     /* secondary text */
--ag-text-3:    #9C958E     /* timestamps, empty state text */
--ag-border:    rgba(26,24,21,0.08)
--ag-info:      #3B7DD8     /* interview event color */
--ag-warning:   #C2850E     /* reminder event color */
--ag-success:   #2D8A56     /* placement event color */
--ag-danger:    #C0392B     /* logout hover */
```

**Dropdown container (all three):**
```css
background: var(--ag-surface-0);
border: 1px solid var(--ag-border);
border-radius: 12px;
box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
overflow: hidden;
position: absolute;
top: calc(100% + 8px);
right: 0;
z-index: 200;
display: flex;
flex-direction: column;
```

---

## What's Out of Scope

- Backend API endpoints for messages, notifications, or read-all mutations
- Full messaging page / chat thread view
- Notification preferences / settings
- Real-time WebSocket or polling updates
- Billing page content
- Team Members page content
- Activity page content
- Full keyboard trap / ARIA `role="dialog"` pattern (these are dropdowns, not modals)
