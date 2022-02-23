const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Notification } = require('../models/notification.model');
require("dotenv").config({ path: `../test.env` });
const { sendError } = require('../utils');

router.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode.userId;
    next();
  } catch(error) {
    sendError(res, error.message);
  }
})

// GET ALL NOTIFICATION OF PARTICULAR USER
router.route('/')
.get(async (req, res, next) => {
  try {
    const allNotification = await Notification.find({ owner: req.user }).populate({
      path: "owner",
      select: "name username photo",
    }).populate({
      path: "actionOwner",
      select: "name username photo"
    });

    return res.status(200).json({
      success: true,
      allNotification,
    })

  } catch(error) {
    sendError(res, error.message);
  }
});

router.route('/remove-notification/:id')
.delete(async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndRemove(id).exec();
    return res.status(202).json({
      success: true,
      deletedNotification,
      id
    })
  } catch(error) {
    sendError(res, error.message);
  }
})

module.exports = router;