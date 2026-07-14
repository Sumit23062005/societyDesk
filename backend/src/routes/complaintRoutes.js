const express = require('express');
const complaintController = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../config/multer');
const { ROLES } = require('../constants/enums');
const {
  createComplaintValidation,
  complaintIdParamValidation,
  updateStatusValidation,
  updatePriorityValidation,
  addNoteValidation,
  getComplaintsQueryValidation
} = require('../validations/complaintValidation');

const router = express.Router();

router.use(protect);

// Resident routes
router.post(
  '/',
  authorize(ROLES.RESIDENT),
  upload.single('photo'),
  createComplaintValidation,
  validateRequest,
  complaintController.createComplaint
);

router.get('/my', authorize(ROLES.RESIDENT), complaintController.getOwnComplaints);

// Admin routes
router.get(
  '/',
  authorize(ROLES.ADMIN),
  getComplaintsQueryValidation,
  validateRequest,
  complaintController.getAllComplaints
);

router.put(
  '/:id/status',
  authorize(ROLES.ADMIN),
  updateStatusValidation,
  validateRequest,
  complaintController.updateStatus
);

router.put(
  '/:id/priority',
  authorize(ROLES.ADMIN),
  updatePriorityValidation,
  validateRequest,
  complaintController.updatePriority
);

router.post(
  '/:id/notes',
  authorize(ROLES.ADMIN),
  addNoteValidation,
  validateRequest,
  complaintController.addNote
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  complaintIdParamValidation,
  validateRequest,
  complaintController.deleteComplaint
);

// Shared routes (resident owner or admin) - kept below parameterized admin
// routes with distinct sub-paths to avoid path collisions.
router.get(
  '/:id/history',
  complaintIdParamValidation,
  validateRequest,
  complaintController.getComplaintHistory
);

router.get(
  '/:id',
  complaintIdParamValidation,
  validateRequest,
  complaintController.getComplaintById
);

module.exports = router;
