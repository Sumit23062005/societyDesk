const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Allow the configured CLIENT_URL, common local dev ports, and any
// *.vercel.app origin (covers production + every preview deployment)
// without needing to update CLIENT_URL every time Vercel generates a new URL.
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(
  Boolean
);

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin header = same-origin request, curl, Postman, server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const hostname = new URL(origin).hostname;
        if (hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch {
        // malformed origin header, fall through to rejection
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body & cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static serving of uploaded complaint photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Society Maintenance Tracker API is running',
    data: {}
  });
});

// 404 + centralized error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;