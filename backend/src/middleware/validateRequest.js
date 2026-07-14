const { validationResult } = require('express-validator');

// Centralized handler that runs after express-validator chains.
// Collects all validation errors into the consistent error response format.
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = validateRequest;
