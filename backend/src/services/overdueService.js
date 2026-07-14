const { COMPLAINT_STATUSES } = require('../constants/enums');

const getOverdueDays = () => Number(process.env.OVERDUE_DAYS) || 5;

// Returns the cutoff Date before which an open/in-progress complaint
// is considered overdue.
const getOverdueCutoffDate = () => {
  const overdueDays = getOverdueDays();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - overdueDays);
  return cutoff;
};

// Mongo match condition reusable in queries/aggregations to find
// complaints that are currently overdue.
const buildOverdueMatchCondition = () => ({
  status: { $in: [COMPLAINT_STATUSES.OPEN, COMPLAINT_STATUSES.IN_PROGRESS] },
  createdAt: { $lt: getOverdueCutoffDate() }
});

// Attaches a computed `isOverdue` boolean to a single complaint (plain object or document).
const attachOverdueFlag = (complaint) => {
  const overdueDays = getOverdueDays();
  const plain = typeof complaint.toObject === 'function' ? complaint.toObject() : complaint;

  const isNonTerminal =
    plain.status === COMPLAINT_STATUSES.OPEN || plain.status === COMPLAINT_STATUSES.IN_PROGRESS;

  const ageDays = (Date.now() - new Date(plain.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  plain.isOverdue = isNonTerminal && ageDays > overdueDays;

  return plain;
};

const attachOverdueFlagToList = (complaints) => complaints.map(attachOverdueFlag);

module.exports = {
  getOverdueDays,
  getOverdueCutoffDate,
  buildOverdueMatchCondition,
  attachOverdueFlag,
  attachOverdueFlagToList
};
