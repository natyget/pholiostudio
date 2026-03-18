# Phase 2: Enhanced Application Management - PLAN

## Overview

Phase 2 builds upon the foundation from Phase 1 by adding advanced application management features that give agencies deeper control over their talent pipeline.

## Sub-Phases

### Phase 2.1: Notes & Tags System (Week 1)
**Goal:** Allow agencies to add context and organization to applications

**Features:**
- ✅ Notes system
  - Add notes to any application
  - View note history
  - Edit/delete notes
  - Timestamp and author tracking
  - Notes panel in applicant detail view

- ✅ Tagging system
  - Create custom tags
  - Apply multiple tags to applications
  - Tag management (create, edit, delete)
  - Filter applicants by tags
  - Tag color customization
  - Popular tags quick-select

**UI Components:**
- Notes panel (sidebar or modal)
- Note card with author and timestamp
- Tag selector dropdown (multi-select)
- Tag pills with colors
- Tag management modal

**Backend Requirements:**
- `notes` table (id, application_id, agency_id, user_id, content, created_at, updated_at)
- `tags` table (id, agency_id, name, color, created_at)
- `application_tags` junction table (application_id, tag_id)
- API endpoints for CRUD operations

---

### Phase 2.2: Application Detail Modal (Week 2)
**Goal:** View and manage applications without leaving the page

**Features:**
- ✅ Full-screen modal
  - Talent profile with full image gallery
  - All application details
  - Status timeline
  - Notes panel (integrated)
  - Tags display and editing
  - Action buttons (Accept/Decline/Archive)
  - Previous/Next navigation

- ✅ Activity timeline
  - Application submitted
  - Status changes
  - Notes added
  - Tags applied
  - Emails sent
  - View history

**UI Components:**
- ApplicationDetailModal component
- Timeline component
- Integrated notes panel
- Image gallery viewer
- Quick actions toolbar

**Backend Requirements:**
- `activities` table (id, application_id, activity_type, description, user_id, created_at)
- GET /api/agency/applications/:id endpoint (full details)
- GET /api/agency/applications/:id/timeline endpoint

---

### Phase 2.3: Bulk Operations (Week 3)
**Goal:** Manage multiple applications efficiently

**Features:**
- ✅ Multi-select mode
  - Checkbox on each row
  - Select all / Deselect all
  - Selection count indicator
  - Bulk action bar (sticky header)

- ✅ Bulk actions
  - Accept selected
  - Decline selected
  - Archive selected
  - Add tag to selected
  - Remove tag from selected
  - Export selected to CSV
  - Send bulk email

- ✅ Confirmation dialogs
  - Confirm bulk accept (with count)
  - Confirm bulk decline (with count)
  - Undo option for sensitive actions

**UI Components:**
- Bulk action toolbar
- Selection counter
- Confirmation modals
- Progress indicator for bulk operations

**Backend Requirements:**
- POST /api/agency/applications/bulk-accept
- POST /api/agency/applications/bulk-decline
- POST /api/agency/applications/bulk-archive
- POST /api/agency/applications/bulk-tag
- GET /api/agency/applications/export endpoint (CSV)

---

### Phase 2.4: Advanced Filters & Search (Week 4)
**Goal:** Find talent faster with powerful search

**Features:**
- ✅ Advanced search
  - Full-text search (name, bio, notes)
  - Search within tags
  - Search by date range
  - Saved searches

- ✅ Advanced filters
  - Multiple cities (OR logic)
  - Tag filters (AND/OR logic)
  - Date range picker (applied date)
  - Has notes filter
  - Multiple status selection
  - Custom filter combinations

- ✅ Filter presets
  - Save current filters as preset
  - Quick-load saved presets
  - Share presets with team
  - Default preset option

**UI Components:**
- Advanced filter panel
- Date range picker
- Multi-select city dropdown
- Tag filter with AND/OR toggle
- Saved filter dropdown
- Filter preset manager

**Backend Requirements:**
- Enhanced search with full-text capabilities
- Filter preset storage
- Complex query builder for filters

---

## Implementation Order

### Week 1: Phase 2.1 (Notes & Tags)
```
Day 1-2: Database schema + migrations
Day 3-4: Backend API endpoints
Day 5-6: Frontend components (notes panel)
Day 7: Frontend components (tags system)
```

### Week 2: Phase 2.2 (Detail Modal)
```
Day 1-2: Activity timeline backend
Day 3-4: ApplicationDetailModal component
Day 5-6: Image gallery + timeline UI
Day 7: Integration + testing
```

### Week 3: Phase 2.3 (Bulk Operations)
```
Day 1-2: Selection state management
Day 3-4: Bulk action backend endpoints
Day 5-6: Bulk action toolbar UI
Day 7: Confirmation flows + testing
```

### Week 4: Phase 2.4 (Advanced Filters)
```
Day 1-2: Advanced search backend
Day 3-4: Filter preset system
Day 5-6: Advanced filter UI components
Day 7: Integration + polish
```

---

## Database Schema (New Tables)

### Notes Table
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES users(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notes_application_id ON notes(application_id);
CREATE INDEX idx_notes_agency_id ON notes(agency_id);
```

### Tags Table
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tags_agency_name ON tags(agency_id, name);
```

### Application Tags (Junction)
```sql
CREATE TABLE application_tags (
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (application_id, tag_id)
);

CREATE INDEX idx_application_tags_application ON application_tags(application_id);
CREATE INDEX idx_application_tags_tag ON application_tags(tag_id);
```

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_application_id ON activities(application_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
```

---

## API Endpoints (New)

### Notes
```
POST   /api/agency/applications/:id/notes       - Create note
GET    /api/agency/applications/:id/notes       - List notes
PATCH  /api/agency/notes/:noteId                - Update note
DELETE /api/agency/notes/:noteId                - Delete note
```

### Tags
```
GET    /api/agency/tags                         - List all tags
POST   /api/agency/tags                         - Create tag
PATCH  /api/agency/tags/:id                     - Update tag
DELETE /api/agency/tags/:id                     - Delete tag

POST   /api/agency/applications/:id/tags        - Add tags to application
DELETE /api/agency/applications/:id/tags/:tagId - Remove tag from application
```

### Activities
```
GET    /api/agency/applications/:id/timeline    - Get activity timeline
```

### Bulk Operations
```
POST   /api/agency/applications/bulk-accept     - Bulk accept
POST   /api/agency/applications/bulk-decline    - Bulk decline
POST   /api/agency/applications/bulk-archive    - Bulk archive
POST   /api/agency/applications/bulk-tag        - Bulk add tag
GET    /api/agency/applications/export          - Export to CSV
```

### Application Detail
```
GET    /api/agency/applications/:id             - Full application details
```

---

## Success Metrics

### Phase 2.1
- [ ] Agencies can add notes to applications
- [ ] Notes are saved and displayed correctly
- [ ] Tags can be created and applied
- [ ] Filter by tags works
- [ ] Tag colors are customizable

### Phase 2.2
- [ ] Application detail modal opens with full info
- [ ] Activity timeline shows all events
- [ ] Can navigate prev/next in modal
- [ ] All actions work from modal

### Phase 2.3
- [ ] Can select multiple applications
- [ ] Bulk actions execute correctly
- [ ] Confirmation dialogs prevent mistakes
- [ ] CSV export generates valid file

### Phase 2.4
- [ ] Advanced search finds relevant results
- [ ] Complex filters work correctly
- [ ] Can save and load filter presets
- [ ] Performance remains good with complex queries

---

## Technical Considerations

### Performance
- Paginated notes (load 20 at a time)
- Debounced search inputs
- Indexed database queries
- React Query caching for tags
- Optimistic updates for quick feedback

### UX
- Loading states for all async operations
- Error boundaries for graceful failures
- Toast notifications for confirmations
- Keyboard shortcuts (Ctrl+A for select all)
- Responsive design for all new components

### Security
- Verify agency ownership of applications
- Validate tag names (max length, no special chars)
- Sanitize note content
- Rate limiting on bulk operations
- Prevent SQL injection in searches

---

## Testing Checklist

Each sub-phase will have its own detailed testing checklist, but overall:
- [ ] Unit tests for new API endpoints
- [ ] Integration tests for bulk operations
- [ ] E2E tests for critical flows
- [ ] Mobile responsiveness testing
- [ ] Performance testing with large datasets
- [ ] Security audit of new endpoints

---

**Estimated Total Time:** 4 weeks
**Next Phase:** Phase 3 - Boards & Analytics
**Status:** 📋 Ready to start Phase 2.1
