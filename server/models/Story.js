const mongoose = require('mongoose');

// A "story" is a short-lived image + caption an owner/agent (or admin) posts —
// shown in a horizontal bar on the homepage, similar to WhatsApp/Instagram
// stories. Each one expires 24 hours after it's posted (expiresAt is set on
// creation and checked whenever stories are listed — see storyController.js).
const storySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    caption: { type: String, default: '', maxlength: 200 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

storySchema.index({ expiresAt: 1 });
storySchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
