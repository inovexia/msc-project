# Document Request System

## Overview
The Document Request System enables accountants to request missing documents from clients efficiently. This system connects accountants, clients, and the upload portal in a seamless workflow.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Accountant Workflow                     │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  1. Identify Missing Documents                     │
│     - Document Collections page                    │
│     - Period Workspace page                        │
│     - "Needs Attention" cards                      │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  2. Click "Request Documents" or "Remind" Button  │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  3. Request Documents Dialog Opens                 │
│     - Add document requests                        │
│     - Specify required/optional                    │
│     - Categorize documents                         │
│     - Write personalized message                   │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  4. System Sends Request                           │
│     - Creates document requests in database        │
│     - Generates magic upload link                  │
│     - Sends email to client                        │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│              Client Workflow                       │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  5. Client Receives Email                          │
│     - Document request list                        │
│     - Personalized message                         │
│     - Magic link to upload portal                  │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  6. Client Clicks Link → /upload Route             │
│     - See list of requested documents              │
│     - Upload files via drag & drop                 │
│     - Assign uploads to requests                   │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  7. Accountant Reviews Uploads                     │
│     - Documents appear in Period Workspace         │
│     - Assign to requests (if not auto-assigned)    │
│     - Approve/reject documents                     │
└───────────────────────────────────────────────────┘
```

---

## Key Components

### 1. `RequestDocumentsDialog` Component

**Location:** `apps/app/app/(authenticated)/accountants/dashboard/components/request-documents-dialog.tsx`

**Features:**
- ✅ Add multiple document requests
- ✅ Specify document name and category
- ✅ Mark as required or optional
- ✅ Quick-add common documents (Bank Statement, Invoice, etc.)
- ✅ Personalized message to client
- ✅ Supports both mock and live modes

**Props:**
```typescript
{
  clientName: string;          // Display name
  periodName: string;           // e.g., "2025-10"
  onSubmit: (requests, message) => void | Promise<void>;
  trigger?: React.ReactNode;    // Custom trigger button
}
```

**Usage Example:**
```typescript
<RequestDocumentsDialog
  clientName="Vance Industries"
  periodName="2025-10"
  onSubmit={handleDocumentRequest}
  trigger={
    <Button>
      <Mail /> Request Documents
    </Button>
  }
/>
```

### 2. Document Request Locations

**A. Document Collections Page** (`/clients`)
- "Remind" buttons in "Needs Attention" cards
- "Remind" buttons in table rows (for incomplete open periods)
- Quick access to request documents for multiple periods

**B. Period Workspace** (`/clients/[clientId]/periods/[period]`)
- "Request Documents" button in header (only for open periods)
- Contextual to the specific period being viewed
- Pre-filled with period information

### 3. Upload Portal

**Location:** `/upload`

**Purpose:** Client-facing portal for document uploads

**Features:**
- Shows list of requested documents
- Drag & drop file upload
- Assign uploads to specific requests
- Track upload status (pending/uploaded)
- Filter by pending/uploaded

**Flow:**
1. Client receives email with magic link
2. Link opens upload portal with their period's requests
3. Client uploads files and assigns to requests
4. Documents appear in accountant's period workspace

---

## API Endpoints

### Required Endpoint (To Be Implemented)

**`POST /api/document-requests`**

Create document requests and notify client.

**Request Body:**
```json
{
  "periodId": "period-1",
  "clientId": "client-1",
  "requests": [
    {
      "title": "Bank Statement",
      "category": "statement",
      "required": true
    },
    {
      "title": "Utility Bill",
      "category": "bill",
      "required": true
    }
  ],
  "message": "Hi,\n\nPlease upload the following documents for October 2025.\n\nThank you!"
}
```

**Response:**
```json
{
  "success": true,
  "requestIds": ["req-1", "req-2"],
  "magicLink": "https://app.com/upload?token=abc123",
  "emailSent": true
}
```

**Backend Tasks:**
1. Create PeriodRequest records in database
2. Generate magic link token
3. Send email to client with:
   - List of requested documents
   - Personalized message
   - Magic upload link
4. Return success status

---

## Email Template

**Subject:** Document Request for [Period] - [Client Name]

**Body:**
```
Hi [Client Name],

[Personalized Message from Accountant]

Please upload the following documents:

Required Documents:
• Bank Statement
• Utility Bill

Optional Documents:
• Additional receipts

Click the link below to securely upload your documents:
[Upload Link]

This link expires in 7 days.

If you have any questions, please don't hesitate to reach out.

Best regards,
[Accountant Name]
[Firm Name]
```

---

## Mock Mode vs Live Mode

### Mock Mode (Default)
**Purpose:** Demo and testing without backend

**Behavior:**
- Shows alert with request details
- Does not send actual emails
- Does not create database records
- Perfect for UI development

**Example Alert:**
```
Document request sent to Vance Industries

Requested:
- Bank Statement
- Utility Bill
- Payroll Records

Message: Hi, Please upload the following documents...
```

### Live Mode
**Purpose:** Production with real backend

**Behavior:**
- Calls `/api/document-requests` endpoint
- Creates database records
- Sends real emails to clients
- Generates magic upload links
- Refreshes data after request sent

---

## User Guide

### For Accountants

**Scenario 1: Period is Missing Documents**

1. Go to **Document Collections** page
2. Look at "Needs Attention" section
3. Find period with missing documents
4. Click **"Remind"** button
5. Dialog opens with:
   - Client name and period pre-filled
   - Empty document request form
6. Add missing documents:
   - Type document name
   - Select category
   - Mark as required/optional
7. Or use **Quick Add** badges for common documents
8. Customize the message to client
9. Click **"Send Request"**
10. Client receives email with upload link

**Scenario 2: Review Period and Request More**

1. Go to period workspace
2. Review submitted documents
3. Notice some required documents missing
4. Click **"Request Documents"** in header
5. Add missing document requests
6. Send to client

**Scenario 3: Quick Common Requests**

Use Quick Add badges to instantly add:
- Bank Statement
- Credit Card Statement
- Utility Bill
- Rent Invoice
- Payroll Records
- Tax Documents
- Receipt
- Invoice

### For Clients

**Receiving the Request:**
1. Client receives email notification
2. Email contains:
   - List of requested documents
   - Personal message from accountant
   - Secure upload link

**Uploading Documents:**
1. Click link in email → Opens upload portal
2. See list of requested documents
3. Drag & drop files or click to browse
4. Assign file to specific request
5. See confirmation when uploaded
6. Accountant is automatically notified

---

## Integration with Existing System

### How It Fits

**Before Document Requests:**
- Accountants had to manually email clients
- No standardized request format
- Hard to track what was requested
- No direct link between request and upload

**With Document Requests:**
- ✅ Standardized request process
- ✅ Automated email notifications
- ✅ Tracked in database (PeriodRequest table)
- ✅ Direct link to upload portal
- ✅ Uploads pre-assigned to requests
- ✅ Easy to see what's missing

### Data Model

```typescript
// PeriodRequest (existing type)
{
  id: string;
  periodId: string;
  title: string;           // "Bank Statement"
  category?: string;       // "statement"
  required: boolean;       // true
  sortOrder: number;
  status: "pending" | "received" | "approved";
}

// Document (existing type)
{
  id: string;
  periodId: string;
  periodRequestId?: string | null;  // Links to request
  filename: string;
  // ... other fields
}
```

**Workflow:**
1. Accountant creates PeriodRequest via dialog
2. Client uploads Document
3. Document.periodRequestId links to PeriodRequest.id
4. PeriodRequest.status updates to "received"
5. Accountant reviews and approves
6. PeriodRequest.status updates to "approved"

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Request documents dialog
- ✅ Mock mode for testing
- ✅ Integration with Document Collections
- ✅ Integration with Period Workspace

### Phase 2 (Next)
- [ ] Implement `/api/document-requests` endpoint
- [ ] Email notification system
- [ ] Magic link generation
- [ ] Connect upload portal to requests

### Phase 3 (Future)
- [ ] Bulk request documents (multiple periods at once)
- [ ] Request templates (save common request sets)
- [ ] Automatic reminders (if not uploaded after X days)
- [ ] SMS notifications option
- [ ] Client acknowledgment of requests
- [ ] Upload deadline tracking

### Phase 4 (Advanced)
- [ ] AI-suggested document requests based on period type
- [ ] Auto-categorize uploads using OCR
- [ ] WhatsApp integration
- [ ] Mobile app for uploads
- [ ] Real-time upload notifications
- [ ] Document request analytics

---

## Testing Checklist

### Mock Mode Testing
- [ ] Open dialog from Document Collections page
- [ ] Open dialog from Period Workspace
- [ ] Add single document request
- [ ] Add multiple document requests
- [ ] Remove document request
- [ ] Use Quick Add badges
- [ ] Edit message
- [ ] Submit with valid data
- [ ] Try to submit with empty requests (should show error)
- [ ] Verify alert shows correct information

### Live Mode Testing (When Implemented)
- [ ] Create requests successfully
- [ ] Verify database records created
- [ ] Verify email sent to client
- [ ] Click magic link → Opens upload portal
- [ ] Upload document via portal
- [ ] Verify document appears in workspace
- [ ] Verify periodRequestId is set
- [ ] Verify request status updates

---

## Troubleshooting

### Issue: "Remind" button doesn't appear
**Cause:** Period is not open or already complete
**Solution:** Button only shows for open periods with missing documents

### Issue: Dialog doesn't open
**Cause:** Missing dependencies
**Solution:** Ensure all UI components are installed (Dialog, Input, Select, etc.)

### Issue: Mock mode alert doesn't show request details
**Cause:** Empty requests array
**Solution:** At least one request with a title is required

### Issue: Upload portal doesn't show requests
**Cause:** Magic link token invalid or requests not loaded
**Solution:** Check token expiration and API endpoint

---

## Configuration

### Environment Variables
```env
# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-api-key

# Magic Link Configuration
MAGIC_LINK_EXPIRY_DAYS=7
MAGIC_LINK_BASE_URL=https://your-app.com

# Feature Flags
ENABLE_DOCUMENT_REQUESTS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

### Default Settings
- **Link Expiry:** 7 days
- **Email From:** noreply@your-firm.com
- **Default Categories:** invoice, receipt, statement, bill, other
- **Max Requests Per Email:** 20

---

## Summary

✅ **Upload route is still needed** - It's the client upload portal

✅ **Document Request System created** - Accountants can now:
- Request missing documents from any page
- Customize requests per period
- Send personalized messages
- Track request status

✅ **Integrated everywhere:**
- Document Collections page (Remind buttons)
- Period Workspace (Request Documents button)
- Works in both Mock and Live modes

✅ **Next Steps:**
1. Implement `/api/document-requests` backend endpoint
2. Set up email notification system
3. Generate and validate magic links
4. Connect upload portal to specific periods/requests

---

*Last updated: October 23, 2025*
