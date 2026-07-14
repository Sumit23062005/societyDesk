const Complaint = require('../models/Complaint');
const { COMPLAINT_STATUSES } = require('../constants/enums');
const { buildOverdueMatchCondition } = require('./overdueService');

const getAdminDashboard = async () => {
  const [statusCounts, categoryCounts, priorityCounts, totalCount, overdueCount] = await Promise.all([
    Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Complaint.countDocuments(),
    Complaint.countDocuments(buildOverdueMatchCondition())
  ]);

  const statusMap = statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const byCategory = categoryCounts.map((item) => ({ category: item._id, count: item.count }));
  const byPriority = priorityCounts.map((item) => ({ priority: item._id, count: item.count }));

  return {
    totalComplaints: totalCount,
    open: statusMap[COMPLAINT_STATUSES.OPEN] || 0,
    inProgress: statusMap[COMPLAINT_STATUSES.IN_PROGRESS] || 0,
    resolved: statusMap[COMPLAINT_STATUSES.RESOLVED] || 0,
    closed: statusMap[COMPLAINT_STATUSES.CLOSED] || 0,
    byCategory,
    byPriority,
    overdueCount
  };
};

module.exports = { getAdminDashboard };
