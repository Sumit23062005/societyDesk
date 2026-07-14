// Wraps async route/controller functions so that any rejected promise
// is forwarded to Express's error-handling middleware via next().
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
