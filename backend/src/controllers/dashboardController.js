const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboardService');

const getAdminDashboard = catchAsync(async (req, res) => {
  const dashboard = await dashboardService.getAdminDashboard();
  sendSuccess(res, 200, 'Dashboard data fetched successfully', { dashboard });
});

module.exports = { getAdminDashboard };
