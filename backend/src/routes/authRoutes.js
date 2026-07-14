const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation
} = require('../validations/authValidation');

const router = express.Router();

router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, updateProfileValidation, validateRequest, authController.updateProfile);

module.exports = router;
