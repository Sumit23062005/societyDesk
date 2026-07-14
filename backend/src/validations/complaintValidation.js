const { body, param, query } = require('express-validator');
const {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUS_LIST,
  COMPLAINT_PRIORITY_LIST
} = require('../constants/enums');

const createComplaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(COMPLAINT_CATEGORIES)
    .withMessage(`Category must be one of: ${COMPLAINT_CATEGORIES.join(', ')}`),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority')
    .optional()
    .isIn(COMPLAINT_PRIORITY_LIST)
    .withMessage(`Priority must be one of: ${COMPLAINT_PRIORITY_LIST.join(', ')}`)
];

const complaintIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid complaint ID')
];

const updateStatusValidation = [
  param('id').isMongoId().withMessage('Invalid complaint ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(COMPLAINT_STATUS_LIST)
    .withMessage(`Status must be one of: ${COMPLAINT_STATUS_LIST.join(', ')}`),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters')
];

const updatePriorityValidation = [
  param('id').isMongoId().withMessage('Invalid complaint ID'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(COMPLAINT_PRIORITY_LIST)
    .withMessage(`Priority must be one of: ${COMPLAINT_PRIORITY_LIST.join(', ')}`)
];

const addNoteValidation = [
  param('id').isMongoId().withMessage('Invalid complaint ID'),
  body('note').trim().notEmpty().withMessage('Note is required').isLength({ max: 500 })
];

const getComplaintsQueryValidation = [
  query('category').optional().isIn(COMPLAINT_CATEGORIES),
  query('status').optional().isIn(COMPLAINT_STATUS_LIST),
  query('priority').optional().isIn(COMPLAINT_PRIORITY_LIST),
  query('overdue').optional().isBoolean().toBoolean(),
  query('resident').optional().isMongoId(),
  query('sort').optional().isIn(['newest', 'oldest', 'priority', 'overdue']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];

module.exports = {
  createComplaintValidation,
  complaintIdParamValidation,
  updateStatusValidation,
  updatePriorityValidation,
  addNoteValidation,
  getComplaintsQueryValidation
};
