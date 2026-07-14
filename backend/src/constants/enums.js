const ROLES = Object.freeze({
  RESIDENT: 'resident',
  ADMIN: 'admin'
});

const COMPLAINT_CATEGORIES = Object.freeze([
  'Electrical',
  'Water',
  'Cleaning',
  'Security',
  'Parking',
  'Lift',
  'Other'
]);

const COMPLAINT_STATUSES = Object.freeze({
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
});

const COMPLAINT_STATUS_LIST = Object.values(COMPLAINT_STATUSES);

const COMPLAINT_PRIORITIES = Object.freeze({
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
});

const COMPLAINT_PRIORITY_LIST = Object.values(COMPLAINT_PRIORITIES);

// Allowed forward transitions in the complaint lifecycle.
// Once Resolved, status can only move to Closed. Closed is final.
const STATUS_TRANSITIONS = Object.freeze({
  [COMPLAINT_STATUSES.OPEN]: [COMPLAINT_STATUSES.IN_PROGRESS, COMPLAINT_STATUSES.RESOLVED],
  [COMPLAINT_STATUSES.IN_PROGRESS]: [COMPLAINT_STATUSES.RESOLVED],
  [COMPLAINT_STATUSES.RESOLVED]: [COMPLAINT_STATUSES.CLOSED],
  [COMPLAINT_STATUSES.CLOSED]: []
});

module.exports = {
  ROLES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LIST,
  COMPLAINT_PRIORITIES,
  COMPLAINT_PRIORITY_LIST,
  STATUS_TRANSITIONS
};
