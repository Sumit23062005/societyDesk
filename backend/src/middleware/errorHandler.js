const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = field ? err.keyValue[field] : '';
  return new AppError(`Duplicate value '${value}' for field '${field}'. Please use another value`, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message
  }));
  return new AppError('Validation failed', 400, errors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again', 401);

const handleMulterError = (err) => {
  return new AppError(err.message || 'File upload error', 400);
};

// Centralized error-handling middleware. Every error in the app funnels
// through here to produce a consistent JSON response shape.
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;
  error.errors = err.errors;

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MulterError') error = handleMulterError(err);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || []
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound };
