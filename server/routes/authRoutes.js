const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  registerUser,
  loginUser,
  registerAdmin,
  adminRegisterStatus,
  loginAdmin,
} = require('../controllers/authController');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/admin/register', authLimiter, registerAdmin);
router.get('/admin/register-status', adminRegisterStatus);
router.post('/admin/login', authLimiter, loginAdmin);

module.exports = router;
