# Phase 3: Communication & Organization Features

**Version:** 1.0
**Date:** February 8, 2026
**Status:** ✅ Complete & Production Ready

## Overview

Phase 3 introduces three major features to enhance agency-talent communication and workflow organization:

1. **Email Notification System** - Automated emails for important events
2. **Interview Scheduling** - Full interview management with calendar integration
3. **Follow-up Reminders** - Smart reminder system for staying organized

---

## Table of Contents

- [Features](#features)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Components](#frontend-components)
- [User Guide](#user-guide)
- [Developer Guide](#developer-guide)
- [Testing](#testing)
- [Production Deployment](#production-deployment)

---

## Features

### 1. Email Notification System

**Purpose:** Keep talent informed about application status and new messages

**Capabilities:**
- ✅ Application accepted notifications
- ✅ Application declined notifications
- ✅ New message alerts
- ✅ HTML email templates with branding
- ✅ Development mode (console logging)
- ✅ Non-blocking async sending
- ✅ Graceful error handling

**Email Templates:**
- Professional HTML design with Pholio branding
- Responsive layout for mobile devices
- Clear call-to-action buttons
- Consistent styling across all emails

**Configuration:**
```javascript
// Development mode (default in src/lib/email.js)
const transporter = {
  sendMail: async (mailOptions) => {
    console.log('[Email] Would send:', mailOptions);
    return { messageId: 'dev-' + Date.now() };
  }
};

// Production mode (configure with real SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
```

---

### 2. Interview Scheduling System

**Purpose:** Streamline interview coordination between agencies and talent

**Features:**
- 📅 Schedule interviews with date/time picker
- 🎥 Support for video calls, phone calls, and in-person meetings
- ⏱️ Flexible durations (15 min to 2 hours)
- 🔄 Reschedule capability
- ❌ Cancel interviews
- 🔗 Direct meeting links (Zoom, Google Meet, etc.)
- 📍 Location tracking for in-person interviews
- 📝 Notes and agenda support
- 🔔 Status tracking (pending, accepted, declined, completed)

**Interview Types:**
1. **Video Call** - Requires meeting URL
2. **Phone Call** - Optional phone number in notes
3. **In Person** - Requires location address

**Workflow:**
```
Agency schedules interview → Pending
         ↓
Talent accepts → Accepted → Interview held → Completed
         OR
Talent declines → Declined
         OR
Agency cancels → Cancelled
         OR
Agency reschedules → New pending interview
```

---

### 3. Follow-up Reminder System

**Purpose:** Help agencies stay organized and never miss follow-ups

**Features:**
- ⏰ Smart reminder scheduling
- 🏷️ 5 reminder types (Follow Up, Callback, Review, Interview Prep, Custom)
- 🎯 Priority levels (Low, Normal, High)
- 💤 Snooze functionality (1hr, 4hr, 24hr, or custom)
- ✅ Mark as completed
- 🚨 Overdue detection with visual indicators
- 📊 Due reminders dashboard widget
- 📝 Notes support

**Reminder Types:**
1. **Follow Up** - General follow-up reminder
2. **Callback** - Schedule a return call
3. **Review** - Review application or portfolio
4. **Interview Prep** - Prepare for upcoming interview
5. **Custom** - Flexible custom reminders

**Priority Levels:**
- 🔵 **Low** - Nice to have, flexible timing
- 🟢 **Normal** - Standard priority (default)
- 🔴 **High** - Urgent, requires immediate attention

---

## Database Schema

### Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- 'AGENCY' or 'TALENT'
  message TEXT NOT NULL,
  attachment_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_application_id ON messages(application_id);
CREATE INDEX idx_messages_application_created ON messages(application_id, created_at);
CREATE INDEX idx_messages_sender_created ON messages(sender_id, created_at);
CREATE INDEX idx_messages_application_read ON messages(application_id, is_read);
```

### Interviews Table

```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposed_datetime TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  interview_type VARCHAR(20) NOT NULL, -- 'video_call', 'phone_call', 'in_person'
  location VARCHAR(500),
  meeting_url VARCHAR(500),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'rescheduled', 'cancelled', 'completed'
  response_message TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_agency_datetime ON interviews(agency_id, proposed_datetime);
CREATE INDEX idx_interviews_talent_datetime ON interviews(talent_id, proposed_datetime);
CREATE INDEX idx_interviews_status_datetime ON interviews(status, proposed_datetime);
```

### Reminders Table

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL, -- 'follow_up', 'callback', 'review', 'interview_prep', 'custom'
  reminder_date TIMESTAMP NOT NULL,
  title VARCHAR(200) NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'snoozed', 'cancelled'
  completed_at TIMESTAMP,
  snoozed_until TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reminders_application_id ON reminders(application_id);
CREATE INDEX idx_reminders_agency_date ON reminders(agency_id, reminder_date);
CREATE INDEX idx_reminders_agency_status_date ON reminders(agency_id, status, reminder_date);
CREATE INDEX idx_reminders_status_date ON reminders(status, reminder_date);
```

---

## API Reference

### Email Notifications

#### Send Application Status Email
```javascript
import { sendApplicationStatusEmail } from './src/lib/email';

await sendApplicationStatusEmail({
  to: 'talent@example.com',
  talentName: 'John Doe',
  agencyName: 'Elite Models',
  status: 'accepted' // or 'declined'
});
```

#### Send New Message Email
```javascript
import { sendNewMessageEmail } from './src/lib/email';

await sendNewMessageEmail({
  to: 'talent@example.com',
  recipientName: 'John Doe',
  senderName: 'Elite Models',
  messagePreview: 'Hi! We would like to...'
});
```

### Messaging API

#### Send Message
```http
POST /api/agency/applications/:applicationId/messages
Content-Type: application/json

{
  "message": "Hello! We loved your portfolio...",
  "attachment_url": "https://example.com/file.pdf" // optional
}
```

#### Get Messages
```http
GET /api/agency/applications/:applicationId/messages

Response: {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "message": "Hello!",
      "sender_type": "AGENCY",
      "created_at": "2026-02-08T10:00:00Z",
      "is_read": false
    }
  ]
}
```

#### Mark Message as Read
```http
POST /api/agency/messages/:messageId/read

Response: {
  "success": true,
  "message": "Message marked as read"
}
```

### Interview API

#### Schedule Interview
```http
POST /api/agency/applications/:applicationId/interviews
Content-Type: application/json

{
  "proposed_datetime": "2026-02-15T14:00:00Z",
  "duration_minutes": 30,
  "interview_type": "video_call",
  "meeting_url": "https://zoom.us/j/123456789",
  "notes": "Portfolio review and Q&A"
}
```

#### Get Interviews
```http
GET /api/agency/interviews?status=pending&upcoming=true

Response: {
  "success": true,
  "data": [...]
}
```

#### Update Interview
```http
PATCH /api/agency/interviews/:interviewId
Content-Type: application/json

{
  "proposed_datetime": "2026-02-16T14:00:00Z",
  "notes": "Updated agenda"
}
```

#### Cancel Interview
```http
DELETE /api/agency/interviews/:interviewId

Response: {
  "success": true,
  "message": "Interview cancelled successfully"
}
```

### Reminders API

#### Create Reminder
```http
POST /api/agency/applications/:applicationId/reminders
Content-Type: application/json

{
  "reminder_type": "follow_up",
  "reminder_date": "2026-02-10T09:00:00Z",
  "title": "Follow up on application",
  "notes": "Check if they received our email",
  "priority": "normal"
}
```

#### Get Reminders
```http
GET /api/agency/reminders?status=pending&due=true

Response: {
  "success": true,
  "data": [...]
}
```

#### Complete Reminder
```http
POST /api/agency/reminders/:reminderId/complete

Response: {
  "success": true,
  "message": "Reminder marked as completed"
}
```

#### Snooze Reminder
```http
POST /api/agency/reminders/:reminderId/snooze
Content-Type: application/json

{
  "snooze_until": "2026-02-10T14:00:00Z"
}
```

---

## Frontend Components

### Messaging

**MessageThread.jsx**
- Real-time message display
- Auto-scroll to latest message
- Send messages with Enter key
- Mark messages as read automatically
- 10-second polling for new messages

**Usage:**
```jsx
import MessageThread from './components/agency/MessageThread';

<MessageThread
  applicationId="uuid"
  talentName="John Doe"
/>
```

### Interview Scheduling

**InterviewScheduler.jsx**
- Modal interface for scheduling
- Three interview types with icons
- Date/time picker
- Duration selector
- Conditional fields (URL for video, location for in-person)

**InterviewCard.jsx**
- Display interview details
- Status badges
- Quick actions: Reschedule, Cancel
- Inline editing
- Meeting link button

**InterviewList.jsx**
- Filter tabs: Upcoming, Pending, Accepted, All
- Auto-refresh every 30 seconds

**Usage:**
```jsx
import InterviewScheduler from './components/agency/InterviewScheduler';
import InterviewList from './components/agency/InterviewList';

// Schedule interview
<InterviewScheduler
  applicationId="uuid"
  talentName="John Doe"
  onClose={() => setShowModal(false)}
/>

// List interviews
<InterviewList />
```

### Reminders

**ReminderCreator.jsx**
- 5 reminder types
- Quick date buttons (Tomorrow, 3 days, 1 week, 2 weeks)
- Priority selector
- Notes field

**ReminderCard.jsx**
- Smart date formatting
- Overdue highlighting
- Quick actions: Complete, Snooze, Delete
- Inline snooze interface

**DueReminders.jsx**
- Dashboard widget
- Shows urgent reminders
- Auto-hides when empty
- Refreshes every minute

**Usage:**
```jsx
import ReminderCreator from './components/agency/ReminderCreator';
import DueReminders from './components/agency/DueReminders';

// Create reminder
<ReminderCreator
  applicationId="uuid"
  talentName="John Doe"
  onClose={() => setShowModal(false)}
/>

// Show due reminders
<DueReminders limit={5} />
```

---

## User Guide

### For Agencies

#### Sending Messages

1. Navigate to an applicant's profile
2. Open the Messages tab
3. Type your message in the text area
4. Press Enter or click Send
5. Talent receives email notification

#### Scheduling Interviews

1. Go to applicant profile
2. Click "Schedule Interview" button
3. Select interview type (Video/Phone/In Person)
4. Choose date and time
5. Set duration (15-120 minutes)
6. Add meeting URL or location
7. Optionally add notes/agenda
8. Click "Schedule Interview"

**Best Practices:**
- Schedule at least 48 hours in advance
- Include clear agenda in notes
- For video calls, test meeting link before interview
- Send reminder message 24 hours before

#### Creating Reminders

1. Open applicant profile
2. Click "Add Reminder" button
3. Select reminder type
4. Choose date/time (or use quick buttons)
5. Set priority level
6. Add title and notes
7. Click "Create Reminder"

**Tips:**
- Use high priority sparingly for urgent items
- Add context in notes for future reference
- Set reminders at realistic times
- Review due reminders daily

#### Managing Due Reminders

1. Check dashboard for due reminders widget
2. Click reminder to view details
3. Complete when done, or snooze for later
4. Use quick snooze for short delays (1-4 hours)
5. Use custom snooze for specific times

---

## Developer Guide

### Adding New Email Templates

1. Open `src/lib/email.js`
2. Create new email function:

```javascript
async function sendCustomEmail({ to, name, customData }) {
  const subject = `Custom Subject`;
  const html = getBaseTemplate(`
    <h2>Hi ${name},</h2>
    <p>${customData.message}</p>
  `);
  return sendEmail({ to, subject, html });
}

module.exports = {
  sendEmail,
  sendApplicationStatusEmail,
  sendNewMessageEmail,
  sendCustomEmail  // Export new function
};
```

3. Use in route handlers:

```javascript
const { sendCustomEmail } = require('../../lib/email');

// In route handler
(async () => {
  try {
    await sendCustomEmail({
      to: user.email,
      name: user.name,
      customData: { message: 'Hello!' }
    });
  } catch (error) {
    console.error('Email error:', error);
  }
})();
```

### Extending Interview Types

To add new interview types (e.g., "assessment", "group_interview"):

1. Update migration (for new installs):
```javascript
// In migration file
table.string('interview_type', 20).notNullable();
// Add comment about new types
```

2. Update frontend selector:
```javascript
// In InterviewScheduler.jsx
const interviewTypes = [
  { value: 'video_call', icon: Video, label: 'Video Call' },
  { value: 'phone_call', icon: Phone, label: 'Phone Call' },
  { value: 'in_person', icon: MapPin, label: 'In Person' },
  { value: 'assessment', icon: FileText, label: 'Assessment' },  // New
];
```

3. Update display logic:
```javascript
// In InterviewCard.jsx
const getTypeIcon = (type) => {
  switch (type) {
    case 'video_call': return <Video />;
    case 'phone_call': return <Phone />;
    case 'in_person': return <MapPin />;
    case 'assessment': return <FileText />;  // New
    default: return null;
  }
};
```

### Adding Reminder Types

Similar process for new reminder types:

```javascript
// In ReminderCreator.jsx
const reminderTypes = [
  { value: 'follow_up', label: 'Follow Up', description: 'General follow-up' },
  { value: 'callback', label: 'Callback', description: 'Schedule a call' },
  { value: 'review', label: 'Review', description: 'Review application' },
  { value: 'interview_prep', label: 'Interview Prep', description: 'Prepare for interview' },
  { value: 'contract_review', label: 'Contract Review', description: 'Review contract' },  // New
  { value: 'custom', label: 'Custom', description: 'Custom reminder' }
];
```

---

## Testing

### Running Tests

```bash
# Run Phase 3 integration tests
node test-phase3-integration.js

# Expected output:
# ✅ ALL PHASE 3 TESTS PASSED
# Features Verified:
#   ✓ Email notifications
#   ✓ Messaging system
#   ✓ Interview scheduling
#   ✓ Reminder system
#   ✓ End-to-end integration
```

### Manual Testing Checklist

#### Email Notifications
- [ ] Accept application → Email sent
- [ ] Decline application → Email sent
- [ ] Send message → Email sent
- [ ] Emails display correctly in inbox
- [ ] HTML renders properly on mobile

#### Messaging
- [ ] Send message as agency
- [ ] Message appears in thread
- [ ] Auto-scroll works
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Messages marked as read
- [ ] Polling updates messages

#### Interviews
- [ ] Schedule video call interview
- [ ] Schedule phone call interview
- [ ] Schedule in-person interview
- [ ] Reschedule interview
- [ ] Cancel interview
- [ ] View upcoming interviews
- [ ] Filter by status
- [ ] Meeting link opens correctly

#### Reminders
- [ ] Create reminder with each type
- [ ] Set different priorities
- [ ] Use quick date buttons
- [ ] Snooze reminder (quick options)
- [ ] Snooze reminder (custom date)
- [ ] Complete reminder
- [ ] View due reminders
- [ ] Filter reminders
- [ ] Overdue indicators show correctly

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Run migrations on production database
- [ ] Configure SMTP for email sending
- [ ] Set environment variables
- [ ] Test email delivery
- [ ] Verify database indexes exist
- [ ] Check foreign key constraints
- [ ] Run integration tests against staging
- [ ] Review activity logs
- [ ] Set up monitoring alerts

### Environment Variables

```bash
# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=noreply@pholio.com
SMTP_PASSWORD=your-password-here
SMTP_FROM=Pholio <noreply@pholio.com>

# Feature Flags (optional)
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_MESSAGING=true
ENABLE_INTERVIEWS=true
ENABLE_REMINDERS=true
```

### Database Migrations

```bash
# Apply migrations
npm run migrate

# Verify migrations
npm run migrate:status

# Expected output:
# Found 44 Completed Migration file/files.
# ...
# 20260208000001_create_messages_table.js
# 20260208000002_create_interviews_table.js
# 20260208000003_create_reminders_table.js
# No Pending Migration files Found.
```

### Monitoring

**Key Metrics to Track:**

1. **Email Deliverability**
   - Delivery rate
   - Bounce rate
   - Open rate (if tracking pixels enabled)

2. **Message System**
   - Messages sent per day
   - Average response time
   - Unread message count

3. **Interviews**
   - Interviews scheduled per week
   - Acceptance rate
   - Cancellation rate
   - No-show rate

4. **Reminders**
   - Active reminders count
   - Completion rate
   - Snooze rate
   - Average time to completion

### Performance Optimization

**Database Query Optimization:**
```sql
-- Add composite indexes for common queries
CREATE INDEX idx_messages_app_unread ON messages(application_id, is_read);
CREATE INDEX idx_interviews_agency_upcoming ON interviews(agency_id, proposed_datetime)
  WHERE status IN ('pending', 'accepted') AND proposed_datetime >= NOW();
CREATE INDEX idx_reminders_agency_due ON reminders(agency_id, reminder_date)
  WHERE status = 'pending' AND reminder_date <= NOW();
```

**Caching Strategy:**
- Cache due reminders count for 1 minute
- Cache interview list for 30 seconds
- Cache unread message count for 10 seconds

### Backup & Recovery

**Critical Tables:**
- `messages` - Contains all communication history
- `interviews` - Contains all interview data
- `reminders` - Contains all reminder data

**Backup Schedule:**
- Hourly: Incremental backups
- Daily: Full backups with 30-day retention
- Weekly: Full backups with 1-year retention

---

## Troubleshooting

### Common Issues

**Emails not sending:**
1. Check SMTP configuration
2. Verify credentials
3. Check firewall/security groups
4. Review email service logs
5. Test with manual email send

**Messages not updating:**
1. Check polling interval (default: 10s)
2. Verify WebSocket connection (if implemented)
3. Check browser console for errors
4. Clear React Query cache

**Interviews not appearing:**
1. Verify foreign key relationships
2. Check timezone handling
3. Confirm date parsing
4. Review query filters

**Reminders not triggering:**
1. Check reminder_date vs current time
2. Verify status is 'pending'
3. Review query logic
4. Check timezone configuration

---

## Future Enhancements

### Planned Features

1. **Email System**
   - Email delivery tracking
   - Unsubscribe management
   - Custom email templates per agency
   - Bulk email campaigns

2. **Messaging**
   - File attachments
   - Rich text formatting
   - Message templates
   - Auto-responses

3. **Interviews**
   - Calendar sync (Google Calendar, Outlook)
   - Video call integration
   - Interview feedback forms
   - Automated reminders

4. **Reminders**
   - Recurring reminders
   - Smart suggestions based on patterns
   - Team reminders (assigned to multiple users)
   - Reminder templates

---

## Support

### Getting Help

- **Documentation:** This file
- **API Reference:** See API Reference section above
- **Bug Reports:** GitHub Issues
- **Feature Requests:** GitHub Discussions

### Reporting Issues

When reporting issues, include:
1. Feature affected (Email/Messaging/Interviews/Reminders)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser/environment details
6. Error messages/screenshots

---

## Changelog

### Version 1.0 (2026-02-08)

**Initial Release**
- ✅ Email notification system
- ✅ In-app messaging
- ✅ Interview scheduling
- ✅ Follow-up reminders
- ✅ Comprehensive testing
- ✅ Full documentation

---

## License

Copyright © 2026 Pholio. All rights reserved.
