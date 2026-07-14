const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: Number(process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
});

const register = catchAsync(async (req, res) => {
  const { name, email, password, phone, flatNumber } = req.body;
  const { user, token } = await authService.registerResident({ name, email, password, phone, flatNumber });

  res.cookie('token', token, cookieOptions());
  sendSuccess(res, 201, 'Registration successful', { user, token });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.cookie('token', token, cookieOptions());
  sendSuccess(res, 200, 'Login successful', { user, token });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('token');
  sendSuccess(res, 200, 'Logout successful', {});
});

const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  sendSuccess(res, 200, 'Profile fetched successfully', { user });
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

module.exports = { register, login, logout, getProfile, updateProfile };
