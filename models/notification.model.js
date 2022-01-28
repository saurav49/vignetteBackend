const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  actionOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  actionType: {
    type: String,
    required: 'Action Type is Required',
  },

  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  }

}, { versionKey: false })

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };