const User = require('../models/User');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const { ROLES } = require('../constants/enums');

const registerResident = async ({ name, email, password, phone, flatNumber }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    flatNumber,
    role: ROLES.RESIDENT
  });

  const token = generateToken({ id: user._id, role: user.role });

  return { user: user.toSafeObject(), token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({ id: user._id, role: user.role });

  return { user: user.toSafeObject(), token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user.toSafeObject();
};

const updateProfile = async (userId, updates) => {
  const allowedFields = ['name', 'phone', 'flatNumber'];
  const sanitizedUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user.toSafeObject();
};

module.exports = { registerResident, login, getProfile, updateProfile };
