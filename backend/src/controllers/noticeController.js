const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const noticeService = require('../services/noticeService');

const createNotice = catchAsync(async (req, res) => {
  const notice = await noticeService.createNotice(req.body, req.user._id);
  sendSuccess(res, 201, 'Notice created successfully', { notice });
});

const getAllNotices = catchAsync(async (req, res) => {
  const notices = await noticeService.getAllNotices();
  sendSuccess(res, 200, 'Notices fetched successfully', { notices, count: notices.length });
});

const getNoticeById = catchAsync(async (req, res) => {
  const notice = await noticeService.getNoticeById(req.params.id);
  sendSuccess(res, 200, 'Notice fetched successfully', { notice });
});

const updateNotice = catchAsync(async (req, res) => {
  const notice = await noticeService.updateNotice(req.params.id, req.body);
  sendSuccess(res, 200, 'Notice updated successfully', { notice });
});

const pinNotice = catchAsync(async (req, res) => {
  const pinned = req.body.pinned !== undefined ? req.body.pinned : true;
  const notice = await noticeService.pinNotice(req.params.id, pinned);
  sendSuccess(res, 200, `Notice ${pinned ? 'pinned' : 'unpinned'} successfully`, { notice });
});

const deleteNotice = catchAsync(async (req, res) => {
  await noticeService.deleteNotice(req.params.id);
  sendSuccess(res, 200, 'Notice deleted successfully', {});
});

module.exports = { createNotice, getAllNotices, getNoticeById, updateNotice, pinNotice, deleteNotice };
