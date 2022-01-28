const { Notification } = require('../models/notification.model');
const { sendError } = require('../utils');

const likedNotificationCreated = async (res, actionOwner, actionType, owner, postId) => {
  try {
    const newNotification = new Notification({ actionOwner, actionType, owner, postId });
    await newNotification.save();

  } catch(error) {
    console.log("2", { error });
    sendError(res, error.message);
  }
}

module.exports = { likedNotificationCreated };