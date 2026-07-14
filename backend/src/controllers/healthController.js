const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/apiResponse');

const healthCheck = (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  sendSuccess(res, 200, 'Service is healthy', {
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStates[mongoose.connection.readyState],
    timestamp: new Date().toISOString()
  });
};

module.exports = { healthCheck };
