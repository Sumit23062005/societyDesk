const express = require('express');
const authRoutes = require('./authRoutes');
const complaintRoutes = require('./complaintRoutes');
const noticeRoutes = require('./noticeRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notices', noticeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);

module.exports = router;
