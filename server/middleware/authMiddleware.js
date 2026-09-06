const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

// Verifies JWT and attaches the full user to req.user.
// Role is ALWAYS re-checked against the database record, never trusted from the token/frontend alone.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('This account has been disabled');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Restrict access to admins only. Always used AFTER `protect`, and always
// re-checks req.user.role from the DB-loaded user, never a client-supplied value.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Admin access only');
};

// Restrict access to property owners/agents or admins
const ownerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
    return next();
  }
  res.status(403);
  throw new Error('Only property owners/agents can perform this action');
};

module.exports = { protect, adminOnly, ownerOrAdmin };
