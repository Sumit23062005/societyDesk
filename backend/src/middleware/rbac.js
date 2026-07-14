const AppError = require('../utils/AppError');

// Usage: authorize('admin') or authorize('admin', 'resident')
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized. Please log in to access this resource', 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new AppError(`Role '${req.user.role}' is not authorized to access this resource`, 403)
    );
  }

  next();
};

module.exports = authorize;
