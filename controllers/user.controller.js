const mongoose = require('mongoose');
const { User } = require("../models/user.model");
const { Notification } = require('../models/notification.model');
const { cloudinary } = require("../db/db.connect");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: `../test.env` });
const { sendError } = require("../utils");

const saveUser = async (res, { name, username, email, password, previewImage }) => {
  if (!password) return sendError(res, "Password not present");
  try {

    let imageUploadResult, newUser;

    if(previewImage) {
      imageUploadResult = await cloudinary.uploader.upload(previewImage, { folder: "users"});  
    }

    if(imageUploadResult) {
      newUser = new User({ name, username, email, password, photo: {
        id: imageUploadResult.public_id,
        secure_url: imageUploadResult.secure_url,
      }})
    } else {
      newUser = new User({ name, username, email, password });
    }

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);

    // set user password to hash password
    newUser.password = await bcrypt.hash(newUser.password, salt);

    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    return sendError(res, error.message);
  }
};

const loginUser = async () => {};

const findByEmail = async (res, email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.log(error);
    sendError(res, error.message);
  }
};

const followUser = async (req, res, currentUser, reqdUser) => {
  try {
     if(req.user.toString() !== reqdUser._id.toString()) {
      currentUser.following.push(reqdUser._id);
      reqdUser.followers.push(currentUser._id);
      await currentUser.save();
      await reqdUser.save();
      
      const actionOwner = mongoose.Types.ObjectId(req.user);
      const actionType = "FOLLOWING";
      const owner = reqdUser._id;
      
      const newNotificationCurrentUser = new Notification({owner, actionOwner, actionType});
      await newNotificationCurrentUser.save();
    }

    return res.status(200).json({
      success: true,
      currentUser,
      reqdUser
    })
  } catch(error) {
    sendError(res, error.message)
  }
}

const unfollowUser = async (req, res, currentUser, reqdUser) => {
  try {
    if(req.user.toString() !== reqdUser._id.toString()) {
      currentUser.following.pull(reqdUser._id);
      reqdUser.followers.pull(currentUser._id);
      await currentUser.save();
      await reqdUser.save();
    }

    return res.status(200).json({
      success: true,
      currentUser,
      reqdUser
    })
  } catch(error) {
    sendError(res, error.message);
  }
}

module.exports = { saveUser, loginUser, findByEmail, followUser, unfollowUser };