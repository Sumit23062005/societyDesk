const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const complaintService = require('../services/complaintService');
const buildFileUrl = require('../utils/fileUrl');

const createComplaint = catchAsync(async (req, res) => {
  const { title, category, description, priority } = req.body;
  const photo = req.file ? req.file.filename : null;

  const complaint = await complaintService.createComplaint({
    title,
    category,
    description,
    priority,
    photo,
    residentId: req.user._id
  });

  const responseData = complaint.toObject ? complaint.toObject() : complaint;
  if (responseData.photo) responseData.photoUrl = buildFileUrl(req, responseData.photo);

  sendSuccess(res, 201, 'Complaint created successfully', { complaint: responseData });
});

const getOwnComplaints = catchAsync(async (req, res) => {
  const complaints = await complaintService.getOwnComplaints(req.user._id);
  const withUrls = complaints.map((c) => ({
    ...c,
    photoUrl: c.photo ? buildFileUrl(req, c.photo) : null
  }));

  sendSuccess(res, 200, 'Complaints fetched successfully', { complaints: withUrls, count: withUrls.length });
});

const getComplaintById = catchAsync(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.id, req.user);
  const responseData = { ...complaint, photoUrl: complaint.photo ? buildFileUrl(req, complaint.photo) : null };

  sendSuccess(res, 200, 'Complaint fetched successfully', { complaint: responseData });
});

const getComplaintHistory = catchAsync(async (req, res) => {
  const history = await complaintService.getComplaintHistory(req.params.id, req.user);
  sendSuccess(res, 200, 'Complaint history fetched successfully', { history });
});

const getAllComplaints = catchAsync(async (req, res) => {
  const { category, status, priority, date, resident, overdue, sort, page, limit } = req.query;

  const result = await complaintService.getAllComplaints({
    category,
    status,
    priority,
    date,
    resident,
    overdue,
    sort,
    page,
    limit
  });

  const withUrls = result.complaints.map((c) => ({
    ...c,
    photoUrl: c.photo ? buildFileUrl(req, c.photo) : null
  }));

  sendSuccess(res, 200, 'Complaints fetched successfully', {
    complaints: withUrls,
    pagination: result.pagination
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { status, note } = req.body;
  const complaint = await complaintService.updateStatus(req.params.id, { status, note }, req.user._id);
  sendSuccess(res, 200, 'Complaint status updated successfully', { complaint });
});

const updatePriority = catchAsync(async (req, res) => {
  const { priority } = req.body;
  const complaint = await complaintService.updatePriority(req.params.id, priority, req.user._id);
  sendSuccess(res, 200, 'Complaint priority updated successfully', { complaint });
});

const addNote = catchAsync(async (req, res) => {
  const { note } = req.body;
  const complaint = await complaintService.addNote(req.params.id, note, req.user._id);
  sendSuccess(res, 200, 'Note added successfully', { complaint });
});

const deleteComplaint = catchAsync(async (req, res) => {
  await complaintService.deleteComplaint(req.params.id);
  sendSuccess(res, 200, 'Complaint deleted successfully', {});
});

module.exports = {
  createComplaint,
  getOwnComplaints,
  getComplaintById,
  getComplaintHistory,
  getAllComplaints,
  updateStatus,
  updatePriority,
  addNote,
  deleteComplaint
};
