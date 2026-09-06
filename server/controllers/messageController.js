const asyncHandler = require('../middleware/asyncHandler');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// @desc  Get conversation list (grouped by the other participant) for logged-in user
// @route GET /api/messages
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
        },
        lastMessage: { $first: '$message' },
        lastMessageAt: { $first: '$createdAt' },
        property: { $first: '$property' },
        unread: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { lastMessageAt: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'participant',
      },
    },
    { $unwind: '$participant' },
    {
      $project: {
        'participant.password': 0,
      },
    },
  ]);

  res.json({ success: true, conversations });
});

// @desc  Get full thread with a specific user
// @route GET /api/messages/:userId
const getThread = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany(
    { sender: otherUserId, receiver: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.json({ success: true, messages });
});

// @desc  Send a message
// @route POST /api/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, property, message } = req.body;

  if (!receiver || !message) {
    res.status(400);
    throw new Error('A recipient and message text are required');
  }

  if (!mongoose.isValidObjectId(receiver)) {
    res.status(400);
    throw new Error('Invalid recipient');
  }

  const newMessage = await Message.create({
    sender: req.user._id,
    receiver,
    property: property || undefined,
    message,
  });

  res.status(201).json({ success: true, message: newMessage });
});

module.exports = { getConversations, getThread, sendMessage };
