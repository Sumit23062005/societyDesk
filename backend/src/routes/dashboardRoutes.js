const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { ROLES } = require('../constants/enums');

const router = express.Router();

router.get('/admin', protect, authorize(ROLES.ADMIN), dashboardController.getAdminDashboard);

module.exports = router;
