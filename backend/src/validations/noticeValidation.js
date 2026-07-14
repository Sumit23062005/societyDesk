const { body, param } = require('express-validator');

const createNoticeValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('important').optional().isBoolean().withMessage('Important must be a boolean'),
  body('pinned').optional().isBoolean().withMessage('Pinned must be a boolean')
];

const updateNoticeValidation = [
  param('id').isMongoId().withMessage('Invalid notice ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('important').optional().isBoolean().withMessage('Important must be a boolean'),
  body('pinned').optional().isBoolean().withMessage('Pinned must be a boolean')
];

const noticeIdParamValidation = [param('id').isMongoId().withMessage('Invalid notice ID')];

module.exports = { createNoticeValidation, updateNoticeValidation, noticeIdParamValidation };
