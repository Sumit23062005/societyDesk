const express = require('express');
const noticeController = require('../controllers/noticeController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { ROLES } = require('../constants/enums');
const {
  createNoticeValidation,
  updateNoticeValidation,
  noticeIdParamValidation
} = require('../validations/noticeValidation');

const router = express.Router();

router.use(protect);

router.get('/', noticeController.getAllNotices);
router.get('/:id', noticeIdParamValidation, validateRequest, noticeController.getNoticeById);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  createNoticeValidation,
  validateRequest,
  noticeController.createNotice
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  updateNoticeValidation,
  validateRequest,
  noticeController.updateNotice
);

router.patch(
  '/:id/pin',
  authorize(ROLES.ADMIN),
  noticeIdParamValidation,
  validateRequest,
  noticeController.pinNotice
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  noticeIdParamValidation,
  validateRequest,
  noticeController.deleteNotice
);

module.exports = router;
