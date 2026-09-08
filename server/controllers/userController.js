const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

// @desc  Get logged-in user's profile
// @route GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc  Update logged-in user's profile
// @route PUT /api/users/me
const updateMe = asyncHandler(async (req, res) => {
  const { name, username, email, phone, bio } = req.body;
  const user = req.user;

  if (username && username.toLowerCase() !== user.username) {
    const taken = await User.findOne({ username: username.toLowerCase() });
    if (taken) {
      res.status(409);
      throw new Error('Username is already taken');
    }
    user.username = username.toLowerCase();
  }

  if (email && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) {
      res.status(409);
      throw new Error('Email is already registered');
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (req.uploadedImage) user.profileImage = req.uploadedImage;

  const updated = await user.save();
  res.json({ success: true, user: updated.toSafeObject() });
});

// @desc  Change password (requires current password)
// @route PUT /api/users/me/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide your current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc  Delete own account
// @route DELETE /api/users/me
const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
});

module.exports = { getMe, updateMe, changePassword, deleteMe };
