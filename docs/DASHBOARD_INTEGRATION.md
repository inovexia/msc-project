# Dashboard Integration Guide

## Overview
This document explains how the new accountant dashboard integrates with the existing periods/requests system and outlines the path to full production readiness.

---

## What We Built

### 1. **Hybrid Dashboard System**

The dashboard now supports **two data modes**:

- **Mock Mode**: Uses static demo data for development and testing the UI
- **Live Mode**: Connects to real backend APIs with periods, requests, and documents

Users can toggle between modes via the "Mock/Live" buttons in the dashboard header.

### 2. **Data Adapter Layer** (`lib/dashboard-adapter.ts`)

Created a transformation layer that converts existing API types to dashboard-compatible format:

```typescript
// Converts API Document → Dashboard Document
adaptDocument(apiDoc, clientName, requests)

// Converts API Client + Periods → Dashboard Client
adaptClient(client, periods, documents, requests)

// Calculates period completion stats
calculatePeriodCompletion(period, requests, documents)

// Gets dashboard-wide statistics
getDashboardStats(documents, requests)
```

**Key mappings:**
- `Document.status` (processing/clean/quarantined) → `DashboardDocument.status` (pending/needs_review/approved/rejected)
- `Document.extracted` (vendor, amount, date) → Dashboard display fields
- `periodRequestId` → Used to determine if document is assigned/unassigned
- Multiple periods per client → Aggregated into client view

### 3. **React Hook** (`hooks/use-dashboard-data.ts`)

Created `useDashboardData()` hook that:
- Fetches all periods from `/api/periods`
- Fetches details for each period (documents, requests, client info)
- Aggregates data across all clients
- Provides real-time stats
- Includes `refresh()` function for manual updates

**Usage:**
```typescript
const { clients, loading, error, stats, periods, refresh } = useDashboardData();
```

### 4. **Enhanced UI Features**

**Inbox View:**
- ✅ Added "Unassigned" filter (shows docs without periodRequestId)
- ✅ Shows all documents across all clients
- ✅ Filters by client, month, document type
- ✅ Bulk selection for batch operations
- ✅ Real-time stats bar (Total, Needs Review, Processing, Approved, Unassigned)

**Client View:**
- ✅ Shows clients with aggregated document stats
- ✅ Progress indicators per client

**Dashboard Header:**
- ✅ Mock/Live toggle
- ✅ Refresh button (live mode only)
- ✅ Inbox/Client view toggle
- ✅ Stats banner showing key metrics

---

## Current State

### ✅ What Works Now

1. **Mock Mode** - Fully functional with demo data
2. **Live Mode** - Fetches real period/document data from API
3. **Data Transformation** - Converts API types to dashboard format
4. **Filtering** - All filters work (Inbox, This Week, Needs Review, Approved, Unassigned, By Client, By Month, By Type)
5. **Stats Display** - Real-time document counts
6. **Dual View** - Toggle between Inbox and Client views

### ⚠️ What Needs Work

1. **Bulk Actions** - UI is present but not connected to API
   - Need to implement bulk approve/reject
   - Need to implement bulk assign to requests

2. **Document Requests Integration**
   - Sidebar doesn't show request categories yet
   - Can't assign documents to requests from dashboard (only from period workspace)

3. **Period Detail View**
   - Need better drill-down from Client view to period workspace
   - Period cards need completion % indicators

4. **File Preview**
   - Document detail panel shows placeholder
   - Need to integrate presigned URL fetching

5. **Real-time Updates**
   - Currently polls every 2 seconds in period workspace
   - Dashboard could benefit from WebSocket updates

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Dashboard Page                          │
│  [Mock/Live Toggle] [Refresh] [Inbox/Client Toggle]    │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴───────────┐
    │                    │
┌───▼────┐         ┌─────▼──────┐
│  Mock  │         │    Live    │
│  Data  │         │    Data    │
└────────┘         └─────┬──────┘
                         │
              ┌──────────▼──────────┐
              │ useDashboardData()  │
              │   React Hook        │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────────┐
              │  Data Adapter Layer     │
              │  (dashboard-adapter.ts) │
              └──────────┬──────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼───┐     ┌────▼────┐    ┌────▼─────┐
    │/api/   │     │/api/    │    │/api/     │
    │periods │     │documents│    │requests  │
    └────────┘     └─────────┘    └──────────┘
```

---

## Next Steps for Production

### Phase 1: Complete Live Mode Integration (Current Priority)

**Week 1-2:**
1. **Implement Bulk Actions API Endpoints**
   ```typescript
   POST /api/documents/bulk-approve
   POST /api/documents/bulk-reject
   POST /api/documents/bulk-assign
   ```

2. **Connect Bulk Action Buttons**
   - Update `InboxDocumentList` to call APIs
   - Show loading states
   - Show success/error toasts
   - Refresh data after actions

3. **Add Document Assignment UI**
   - Show period request dropdown in detail panel
   - Drag & drop to assign documents to requests
   - Quick assign from document list

**Week 3:**
4. **Enhance Period Integration**
   - Add period completion cards to Client View
   - Show missing requests
   - Click period card → Open period workspace
   - Show period status (open, in_review, closed)

5. **Add File Preview**
   - Integrate presigned URL generation
   - Show document preview in detail panel
   - Support PDF, images, common formats

**Week 4:**
6. **Real-time Updates**
   - Add WebSocket support for live updates
   - Update counts when documents change
   - Show notifications for new uploads

### Phase 2: Workflow Enhancements

**Month-End Focus:**
1. Add "Ready to Close" period status
2. Bulk export completed periods
3. Client notification system
4. Missing document reminders

**Document Requests:**
1. Show request categories in sidebar
2. Filter by request type
3. Request fulfillment tracking
4. Auto-assign documents using AI/OCR data

### Phase 3: Advanced Features

1. **Keyboard Shortcuts**
   - j/k to navigate
   - x to select
   - e to approve
   - r to reject

2. **Search**
   - Full-text search across documents
   - Search by vendor, amount, date range
   - Saved search filters

3. **Analytics**
   - Processing time metrics
   - Client submission patterns
   - Month-over-month trends

---

## API Endpoints Reference

### Existing Endpoints (Working)
```
GET  /api/periods                  # List all periods
GET  /api/periods/:id              # Get period details with documents/requests
GET  /api/documents?periodId=:id   # List documents for period
PATCH /api/documents               # Assign document to request
POST /api/mock/uploads/confirm     # Confirm document upload
```

### Needed Endpoints (To Be Implemented)
```
POST /api/documents/bulk-approve   # Approve multiple documents
POST /api/documents/bulk-reject    # Reject multiple documents
POST /api/documents/bulk-assign    # Assign multiple docs to request
GET  /api/documents/:id/download   # Get presigned URL for download
PUT  /api/periods/:id/status       # Update period status
POST /api/periods/:id/export       # Export period to accounting software
```

---

## Testing Strategy

### Manual Testing Checklist

**Mock Mode:**
- [ ] All filters work correctly
- [ ] Document selection/deselection works
- [ ] View toggle works (Inbox ↔ Client)
- [ ] UI is responsive
- [ ] Bulk action buttons appear when items selected

**Live Mode:**
- [ ] Data loads from API
- [ ] Stats are accurate
- [ ] Refresh button works
- [ ] Documents show correct status
- [ ] Client names display correctly
- [ ] Filters work with real data
- [ ] Error handling works (simulate API failure)

**Integration:**
- [ ] Toggle between Mock and Live modes
- [ ] Data formats match between modes
- [ ] No console errors
- [ ] Loading states show appropriately

### Automated Testing (Future)

```typescript
// Example test structure
describe('Dashboard Integration', () => {
  it('should fetch and display period data')
  it('should calculate document counts correctly')
  it('should filter documents by status')
  it('should handle API errors gracefully')
  it('should refresh data on demand')
})
```

---

## Configuration

### Environment Variables
```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_LIVE_MODE=true
NEXT_PUBLIC_ENABLE_BULK_ACTIONS=false # Coming soon
NEXT_PUBLIC_ENABLE_WEBSOCKETS=false   # Coming soon
```

### Feature Flags in Code
```typescript
// Enable/disable live mode programmatically
const FEATURES = {
  liveMode: process.env.NEXT_PUBLIC_ENABLE_LIVE_MODE === 'true',
  bulkActions: process.env.NEXT_PUBLIC_ENABLE_BULK_ACTIONS === 'true',
  websockets: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === 'true',
}
```

---

## Troubleshooting

### Issue: "No periods found" in Live Mode
**Cause:** No period data in database
**Solution:**
1. Check if `/api/periods` returns data
2. Create test periods via API or database
3. Verify authentication is working

### Issue: Documents show as "pending" when they should be "approved"
**Cause:** Status mapping may need adjustment
**Solution:**
1. Check `mapDocumentStatus()` in `dashboard-adapter.ts`
2. Verify `periodRequestId` is populated for approved docs
3. Check if period request status is "approved"

### Issue: Stats don't match document counts
**Cause:** Filtering logic discrepancy
**Solution:**
1. Compare `getDashboardStats()` logic with filter logic in `InboxView`
2. Ensure same criteria used for both
3. Check for race conditions in async data fetching

### Issue: Live mode is slow
**Cause:** Fetching all period details sequentially
**Solution:**
1. Currently uses `Promise.all()` for parallel fetching
2. Consider pagination or lazy loading
3. Add caching layer
4. Implement server-side aggregation endpoint

---

## Performance Considerations

### Current Performance
- Fetches N periods in parallel (fast)
- Fetches M documents per period (can be slow with many documents)
- No caching (refetch on every refresh)

### Optimization Strategies
1. **Server-side Aggregation** - Create `/api/dashboard/stats` endpoint
2. **Pagination** - Load periods on-demand
3. **Caching** - Use React Query or SWR for client-side caching
4. **Lazy Loading** - Load document details only when needed
5. **Virtualization** - Use virtual scrolling for large document lists

---

## Migration Path

For existing users of the period workspace:

1. **Phase 1** (Current) - Both systems coexist
   - Dashboard for overview and bulk actions
   - Period workspace for detailed review
   - Link between them

2. **Phase 2** - Consolidation
   - Move period workspace features into dashboard
   - Keep period route for backward compatibility
   - Redirect to dashboard by default

3. **Phase 3** - Deprecation (Optional)
   - Fully migrate to dashboard
   - Remove old period workspace
   - Update documentation

---

## Additional Resources

- [Product Planning](./PRODUCT_PLANNING.md) - Overall product vision
- [API Documentation](../apps/api/README.md) - API endpoint details
- [Component Library](../packages/design-system/README.md) - UI components

---

*Last updated: October 23, 2025*
