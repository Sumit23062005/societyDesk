const dotenv = require('dotenv');

dotenv.config();

const validateEnv = require('./config/env');
validateEnv();

const app = require('./app');
const connectDB = require('./config/db');
const startOverdueJob = require('./jobs/overdueJob');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    startOverdueJob();
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => process.exit(0));
  });
};

startServer();
