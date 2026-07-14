# UrbanLink — Society Maintenance Portal (React)

A React + Vite + Tailwind CSS conversion of the UrbanLink Stitch mockups: Login, Register,
Notice Board, My Complaints, Admin Dashboard, and Complaint Details.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  components/
    Icon.jsx          Material Symbols icon wrapper
    AdminSidebar.jsx   Shared left nav (Dashboard / Complaints / Notice Board / Residents)
    TopBar.jsx          Shared top app bar with search + avatar
    MobileNav.jsx       Bottom nav for small screens
  pages/
    Login.jsx
    Register.jsx
    NoticeBoard.jsx
    MyComplaints.jsx
    AdminDashboard.jsx
    ComplaintDetails.jsx
  App.jsx               Route table (react-router-dom)
  main.jsx               Entry point
  index.css              Tailwind directives + shared utility classes
tailwind.config.js        Unified design-token palette (colors, spacing, type scale)
```

## What's interactive

- **Login / Register** — controlled inputs, working show/hide password toggle, submit
  navigates into the app.
- **Notice Board** — live search filter, "Post New Notice" modal that prepends a new card
  to the board and updates the pinned counter.
- **My Complaints** — search + status filter, clicking a complaint opens a slide-over with
  a progress timeline, "Raise New Complaint" modal.
- **Admin Dashboard** — stat cards, category breakdown, SLA donut, and a complaints table
  whose rows link to the Complaint Details page.
- **Complaint Details** — status/priority selects, overdue toggle, "Update Complaint" button
  shows a saving → success state.

## Design tokens

The six original mockups each carried slightly different Material-3-style color tokens.
This conversion consolidates them into one consistent palette in `tailwind.config.js`
(emerald primary `#064e3b`, warm amber tertiary for warnings, neutral surface scale) so the
app reads as one cohesive product rather than six disconnected screens.
