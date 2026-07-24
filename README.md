# RaaS Admin Review Queue Mockup

A React + TypeScript + Tailwind CSS mockup of the RaaS Admin Review module for Admin Console.

## Features

### MVP (Phase 1) - Implemented

- ✅ **Admin Review Queue** - Table view of review cases
- ✅ **Mock Data** - 15 realistic review cases with varied statuses and priorities
- ✅ **Filters & Sorting** - Filter by status, priority, assignee, client
- ✅ **Saved Views** - Quick access to common views (Unassigned, My Queue, Escalated, Overdue, P0 Priority, OH/DA Needed, Closure Needed)
- ✅ **Case Details Panel** - Side panel showing case information
- ✅ **Status & Assignment** - Change case status and reassign cases
- ✅ **Account History Modal** - View prior reviews and state history
- ✅ **SLA Indicators** - Visual highlighting of overdue cases
- ✅ **Queue Statistics** - Active case count and overdue count in header

### Phase 2 - To Do

- [ ] Escalation workflows UI
- [ ] OH/DA and Closure queue views
- [ ] Manager dashboard
- [ ] Detailed audit trail viewer
- [ ] Sticky ownership logic
- [ ] Richer reason codes and summary signals

### Phase 3 - To Do

- [ ] Advanced filters and saved custom views
- [ ] Operational analytics and reporting
- [ ] ML-driven prioritization UI
- [ ] Context-preserving deep links to Residents console

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── QueueTable.tsx       # Main queue table
│   ├── QueueFilters.tsx     # Filter controls
│   ├── SavedViews.tsx       # Saved view buttons
│   ├── CaseDetailPanel.tsx  # Side panel for case details
│   └── AccountHistoryModal.tsx  # Modal for account history
├── data/
│   └── mockCases.ts     # Mock data (15 test cases)
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Tailwind CSS imports
```

## Key Type Definitions

- `ReviewCase` - Main data model for a review case
- `CaseStatus` - Valid case states (New, Assigned, In Review, etc.)
- `CasePriority` - Priority levels (P0, P1, P2)
- `ReviewReason` - Reason codes for case creation
- `EscalationType` - Types of escalations

## Mock Data

The app includes 15 mock review cases covering:

- Different statuses (New, Assigned, In Review, Done, Escalated, etc.)
- Different priorities (P0, P1, P2)
- Multiple clients
- Various review reasons
- Different assignments
- Cases with prior review history
- Overdue and upcoming due dates

## Customization

### Adding More Mock Cases

Edit `src/data/mockCases.ts` to add or modify test data.

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme.

### Modifying Statuses or Priorities

Update `src/types/index.ts` and the mock data accordingly.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Notes

- This is a non-connected mockup with no backend data
- All state changes are local to the session
- The "View in Residents Console" button is a placeholder
- Account history is simulated based on other cases in the dataset

## Next Steps

1. Add Phase 2 features (escalations, OH/DA, closure workflows)
2. Build out manager dashboard and reporting views
3. Add audit trail UI
4. Create API integration layer when backend is ready
5. Add authentication and permissions
