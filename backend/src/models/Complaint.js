const mongoose = require('mongoose');
const {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LIST,
  COMPLAINT_PRIORITIES,
  COMPLAINT_PRIORITY_LIST
} = require('../constants/enums');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    photo: {
      type: String,
      default: null
    },
    priority: {
      type: String,
      enum: COMPLAINT_PRIORITY_LIST,
      default: COMPLAINT_PRIORITIES.MEDIUM
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUS_LIST,
      default: COMPLAINT_STATUSES.OPEN
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    closedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

complaintSchema.index({ resident: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });

// Virtual: determines overdue status at query time based on OVERDUE_DAYS.
// Not persisted, computed on demand via the overdue service/middleware.
complaintSchema.methods.isOverdueNow = function isOverdueNow(overdueDays) {
  if (
    this.status === COMPLAINT_STATUSES.RESOLVED ||
    this.status === COMPLAINT_STATUSES.CLOSED
  ) {
    return false;
  }
  const ageMs = Date.now() - this.createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays > overdueDays;
};

module.exports = mongoose.model('Complaint', complaintSchema);
