const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { buildOverdueMatchCondition } = require('../services/overdueService');

// Runs once every hour and logs the current count of overdue complaints.
// isOverdue itself is always computed on-demand (see overdueService), this
// job exists to surface visibility/logging for monitoring purposes.
const startOverdueJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const count = await Complaint.countDocuments(buildOverdueMatchCondition());
      console.log(`[Overdue Job] Currently overdue complaints: ${count}`);
    } catch (error) {
      console.error(`[Overdue Job] Failed to compute overdue count: ${error.message}`);
    }
  });
};

module.exports = startOverdueJob;
