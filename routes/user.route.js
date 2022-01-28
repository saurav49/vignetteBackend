const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require('../models/user.model');
const { sendError } = require("../utils");
require("dotenv").config({ path: `../test.env` });

const { findByEmail, saveUser, followUser, unfollowUser } = require("../controllers/user.controller");

const generateAndGetToken = (res, savedUser) => {
  jwt.sign(
    { userId: savedUser._id },
    process.env.SECRET_KEY,
    { expiresIn: "24h" },
    function (err, token) {
      if (err) {
        sendError(res, err.message);
      } else {
        return res.status(200).json({
          success: true,
          savedUser,
          token,
        });
      }
    }
  );
};

router.route("/signup").post(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await findByEmail(res, email);
    if (user) {
      return sendError(res, "User Already present");
    }

    const savedUser = await saveUser(res, req.body);
    return generateAndGetToken(res, savedUser);
  } catch(error) {
    return sendError(res, error.message);
  }
});

router.route("/login").post(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findByEmail(res, email);
    if (!user) {
      sendError(res, "User not found");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      sendError(res, "Incorrect Password");
    }

    generateAndGetToken(res, user);
  } catch(error) {
    sendError(res, error.message);
  }
});

router.route("/followuser/:username").post(async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode.userId;

    const { username } = req.params;

    const reqdUser = await User.findOne({ username })
    const currentUser = await User.findOne({ _id: req.user });

    followUser(req, res, currentUser, reqdUser);
  } catch(error) {
    sendError(res, error.message);
  }
})

router.route("/unfollowuser/:username").post(async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode.userId;

    const { username } = req.params;
    const reqdUser = await User.findOne({ username })
    const currentUser = await User.findOne({ _id: req.user });

    unfollowUser(req, res, currentUser, reqdUser)
  } catch(error) {
    sendError(res, error.message);
  }
})

module.exports = router;
