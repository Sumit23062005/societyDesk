const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendStatusChangeEmail } = require('./emailService');
const {
  attachOverdueFlag,
  attachOverdueFlagToList,
  buildOverdueMatchCondition,
  getOverdueDays
} = require('./overdueService');
const { COMPLAINT_STATUSES, STATUS_TRANSITIONS } = require('../constants/enums');

const createComplaint = async ({ title, category, description, priority, photo, residentId }) => {
  const complaint = await Complaint.create({
    title,
    category,
    description,
    priority,
    photo,
    resident: residentId,
    status: COMPLAINT_STATUSES.OPEN
  });

  await ComplaintHistory.create({
    complaint: complaint._id,
    previousStatus: null,
    newStatus: COMPLAINT_STATUSES.OPEN,
    actor: residentId,
    note: 'Complaint created'
  });

  return attachOverdueFlag(complaint);
};

const getOwnComplaints = async (residentId) => {
  const complaints = await Complaint.find({ resident: residentId }).sort({ createdAt: -1 });
  return attachOverdueFlagToList(complaints);
};

const getComplaintById = async (complaintId, requestingUser) => {
  const complaint = await Complaint.findById(complaintId).populate('resident', 'name email flatNumber');

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  const isOwner = complaint.resident._id.toString() === requestingUser._id.toString();

  if (requestingUser.role !== 'admin' && !isOwner) {
    throw new AppError('You are not authorized to view this complaint', 403);
  }

  return attachOverdueFlag(complaint);
};

const getComplaintHistory = async (complaintId, requestingUser) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  const isOwner = complaint.resident.toString() === requestingUser._id.toString();
  if (requestingUser.role !== 'admin' && !isOwner) {
    throw new AppError('You are not authorized to view this complaint history', 403);
  }

  const history = await ComplaintHistory.find({ complaint: complaintId })
    .populate('actor', 'name role')
    .sort({ timestamp: 1 });

  return history;
};

const buildAdminFilterQuery = (filters) => {
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.resident) query.resident = filters.resident;

  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: start, $lte: end };
  }

  if (filters.overdue === true) {
    Object.assign(query, buildOverdueMatchCondition());
  }

  return query;
};

const buildSortOption = (sort) => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'priority':
      return { priorityWeight: -1, createdAt: -1 };
    case 'overdue':
      return { createdAt: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

const getAllComplaints = async (filters) => {
  const query = buildAdminFilterQuery(filters);
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  let complaints = await Complaint.find(query).populate('resident', 'name email flatNumber');

  if (filters.sort === 'priority') {
    complaints = complaints.sort(
      (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (filters.sort === 'overdue') {
    complaints = attachOverdueFlagToList(complaints).sort((a, b) => {
      if (a.isOverdue === b.isOverdue) return new Date(b.createdAt) - new Date(a.createdAt);
      return a.isOverdue ? -1 : 1;
    });
  } else if (filters.sort === 'oldest') {
    complaints = complaints.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    complaints = complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = complaints.length;
  const paginated = complaints.slice(skip, skip + limit);

  return {
    complaints: attachOverdueFlagToList(paginated),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const ensureValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    throw new AppError(`Complaint is already in '${currentStatus}' status`, 400);
  }

  if (currentStatus === COMPLAINT_STATUSES.CLOSED) {
    throw new AppError('This complaint is closed and cannot be updated further', 400);
  }

  const allowedNext = STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
      400
    );
  }
};

const updateStatus = async (complaintId, { status, note }, actorId) => {
  const complaint = await Complaint.findById(complaintId).populate('resident', 'name email');

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  ensureValidTransition(complaint.status, status);

  const previousStatus = complaint.status;
  complaint.status = status;

  if (status === COMPLAINT_STATUSES.RESOLVED || status === COMPLAINT_STATUSES.CLOSED) {
    complaint.closedAt = complaint.closedAt || new Date();
  }

  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    previousStatus,
    newStatus: status,
    actor: actorId,
    note: note || ''
  });

  await sendStatusChangeEmail({
    resident: complaint.resident,
    complaint,
    previousStatus,
    note
  });

  return attachOverdueFlag(complaint);
};

const updatePriority = async (complaintId, priority, actorId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  if (complaint.status === COMPLAINT_STATUSES.CLOSED) {
    throw new AppError('This complaint is closed and cannot be updated further', 400);
  }

  complaint.priority = priority;
  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    previousStatus: complaint.status,
    newStatus: complaint.status,
    actor: actorId,
    note: `Priority changed to ${priority}`
  });

  return attachOverdueFlag(complaint);
};

const addNote = async (complaintId, note, actorId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  await ComplaintHistory.create({
    complaint: complaint._id,
    previousStatus: complaint.status,
    newStatus: complaint.status,
    actor: actorId,
    note
  });

  return attachOverdueFlag(complaint);
};

const deleteComplaint = async (complaintId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  await ComplaintHistory.deleteMany({ complaint: complaintId });
  await complaint.deleteOne();
};

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
