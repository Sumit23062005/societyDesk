const mongoose = require('mongoose');
const { COMPLAINT_STATUS_LIST } = require('../constants/enums');

// Immutable audit trail of every status change made to a complaint.
// Entries in this collection must never be updated or deleted.
const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true
    },
    previousStatus: {
      type: String,
      enum: [...COMPLAINT_STATUS_LIST, null],
      default: null
    },
    newStatus: {
      type: String,
      enum: COMPLAINT_STATUS_LIST,
      required: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
  }
);

complaintHistorySchema.index({ complaint: 1, timestamp: 1 });

module.exports = mongoose.model('ComplaintHistory', complaintHistorySchema);
