const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Register a new property-seeker account. Owner/agent and admin accounts can
//        never be created through this public endpoint — owners/agents are onboarded
//        by an admin (see createOwnerOrAgent), and the first admin is created via
//        the one-time /auth/admin/register flow. This is enforced here regardless of
//        what the request body contains.
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, phone, password, confirmPassword } = req.body;

  if (!name || !username || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    res.status(409);
    throw new Error('Username is already taken');
  }

  // Public self-registration is ALWAYS a seeker account, no matter what the client sends.
  const user = await User.create({ name, username, email, phone, password, role: 'seeker' });

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc  Login with email or username
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error('Please provide your email/username and password');
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been disabled. Contact support.');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admins must log in through the admin portal');
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc  Register the FIRST admin account only. Locked once any admin exists.
// @route POST /api/auth/admin/register
const registerAdmin = asyncHandler(async (req, res) => {
  const adminCount = await User.countDocuments({ role: 'admin' });

  if (adminCount > 0) {
    res.status(403);
    throw new Error('Admin registration is already closed.');
  }

  const { name, username, email, password, confirmPassword } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    res.status(409);
    throw new Error('Username is already taken');
  }

  const admin = await User.create({
    name,
    username,
    email,
    phone: req.body.phone || 'N/A',
    password,
    role: 'admin',
  });

  res.status(201).json({
    success: true,
    token: generateToken(admin._id, admin.role),
    user: admin.toSafeObject(),
  });
});

// @desc  Check whether admin registration is still open (used by the frontend to show/hide the form)
// @route GET /api/auth/admin/register-status
const adminRegisterStatus = asyncHandler(async (req, res) => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  res.json({ open: adminCount === 0 });
});

// @desc  Admin login
// @route POST /api/auth/admin/login
const loginAdmin = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error('Please provide your email/username and password');
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    role: 'admin',
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc  Admin creates an owner/agent (or seeker) account on someone's behalf.
//        This is the ONLY way an owner/agent account can be created — there is no
//        public sign-up path for that role. Requires an authenticated admin (see
//        adminRoutes: protect + adminOnly applied before this handler runs).
// @route POST /api/admin/users
const createOwnerOrAgent = asyncHandler(async (req, res) => {
  const { name, username, email, phone, password, role } = req.body;

  if (!name || !username || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Admin can create either a seeker or an owner/agent this way — but never another admin.
  const safeRole = role === 'seeker' ? 'seeker' : 'owner';

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    res.status(409);
    throw new Error('Username is already taken');
  }

  const user = await User.create({ name, username, email, phone, password, role: safeRole });

  res.status(201).json({ success: true, user: user.toSafeObject() });
});

module.exports = {
  registerUser,
  loginUser,
  registerAdmin,
  adminRegisterStatus,
  loginAdmin,
  createOwnerOrAgent,
};
