const Notice = require('../models/Notice');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendNoticeEmail } = require('./emailService');
const { ROLES } = require('../constants/enums');

const createNotice = async ({ title, description, important, pinned }, createdBy) => {
  const notice = await Notice.create({
    title,
    description,
    important: !!important,
    pinned: !!pinned,
    createdBy
  });

  if (notice.important) {
    const residents = await User.find({ role: ROLES.RESIDENT, isActive: true }).select('name email');
    await Promise.all(
      residents.map((resident) => sendNoticeEmail({ resident, notice }))
    );
  }

  return notice;
};

const getAllNotices = async () => {
  return Notice.find().sort({ pinned: -1, createdAt: -1 }).populate('createdBy', 'name role');
};

const getNoticeById = async (noticeId) => {
  const notice = await Notice.findById(noticeId).populate('createdBy', 'name role');
  if (!notice) {
    throw new AppError('Notice not found', 404);
  }
  return notice;
};

const updateNotice = async (noticeId, updates) => {
  const allowedFields = ['title', 'description', 'important', 'pinned'];
  const sanitizedUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  const notice = await Notice.findByIdAndUpdate(noticeId, sanitizedUpdates, {
    new: true,
    runValidators: true
  });

  if (!notice) {
    throw new AppError('Notice not found', 404);
  }

  return notice;
};

const pinNotice = async (noticeId, pinned) => {
  const notice = await Notice.findByIdAndUpdate(
    noticeId,
    { pinned },
    { new: true, runValidators: true }
  );

  if (!notice) {
    throw new AppError('Notice not found', 404);
  }

  return notice;
};

const deleteNotice = async (noticeId) => {
  const notice = await Notice.findById(noticeId);
  if (!notice) {
    throw new AppError('Notice not found', 404);
  }
  await notice.deleteOne();
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  pinNotice,
  deleteNotice
};
