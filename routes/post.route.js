const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { sendError } = require("../utils");
const { Notification } = require("../models/notification.model");
const { Post } = require("../models/post.model");
const { User } = require("../models/user.model");
require("dotenv").config({ path: `../test.env` });

const { getAllPostByUsername, createNewPost, getAllPost, deletePostById, unlikePost, removeRetweetFromPost } = require('../controllers/post.controller');

router.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode.userId;
    next();
  } catch (error) {
    sendError(res, "Unauthorized access");
  }
});

router.route("/feed").get(async (req, res, next) => {
  try {
    const LIMIT = 3;
    let postList;
    // DECODING CURSOR
    let cursor = req.query.cursor;
    const userList = await User.findOne({ _id: req.user }, "following").exec();

    if(cursor) {
      const bufferObj = Buffer.from(cursor, "base64");
      cursor = bufferObj.toString("utf8");

      postList = await Post.find({ userId: { $in: [...userList.following, req.user] }, createdAt: { $lt: cursor }}).sort({ createdAt: -1 }).limit(LIMIT).populate({ path: "userId", select: "username name photo"}).populate({ path: "retweet", select: "username name photo"}).populate({ path: "comments", populate: {
        path: "commentOwner",
        model: "User"
      }}).exec();

    } else {
      postList = await Post.find({ userId: { $in: [...userList.following, req.user] }}).sort({ createdAt: -1}).limit(LIMIT).populate({ path: "userId", select: "username name photo" }).populate({ path: "retweet", select: "username name photo"}).populate({ path: "comments", populate: {
        path: "commentOwner",
        select: "username name photo"
      }}).exec();
    }

    const hasMore = postList.length === LIMIT;
    let nextCursor = null;

    if(hasMore) {
      nextCursor = postList[postList.length - 1].createdAt;
      // ENCODING CURSOR
      const bufferObj = Buffer.from(nextCursor, "utf8");
      nextCursor = bufferObj.toString("base64");
    }

    return res.status(200).json({
      success: true,
      postList,
      paging: {
        nextCursor,
        hasMore,
      }
    })
  } catch(error) {
    sendError(res, error.message);
  }
})

router.route("/:username").get(async (req, res, next) => {
  try {
    const { username } = req.params;
    const userId = await User.findOne({ username }, "userId").exec();

    getAllPostByUsername(res, userId);
  } catch (error) {
    sendError(res, error.message);
  }
});

router
  .route("/")
  .post(async (req, res, next) => {
    try {
      const userId = req.user;
      const { text } = req.body;

      createNewPost(res, userId, text);
    } catch (error) {
      sendError(res, error.message);
    }
  })
  .get(async (req, res, next) => {
    try {
      const userId = req.user;
      const followingUsers = await User.findOne({ _id: userId }, "following").exec();

      getAllPost(req, res, followingUsers);
    } catch (error) {
      sendError(res, error.message);
    }
  });

router.route("/:postId").delete(async (req, res, next) => {
  try {
    const { postId } = req.params;

    deletePostById(res, postId);
  } catch (error) {
    sendError(res, error.message);
  }
});

router.route("/like/:postId").post(async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user;
    
    const reqdPost = await Post.findById(postId).exec();
    reqdPost.likes.push(userId);

    await reqdPost.save();

    const populatePost = await Post.findById(postId).populate({
      path: "likes",
      select: "name username",
    }).exec();

    const reqdPostOwnerId = await Post.findById(postId).select('userId');

    if(userId.toString() !== reqdPostOwnerId.userId.toString()) {
      const actionOwner = req.user;
      const actionType = "LIKED";
      const owner = reqdPostOwnerId.userId;
      const newNotification = new Notification({ actionOwner, actionType, owner, postId });
      await newNotification.save();
    }

    return res.status(200).json({
      success: true,
      postId,
      userId,
      like: populatePost.likes[populatePost.likes.length - 1],
    });

  } catch (error) {
    sendError(res, error.message);
  }
});

router.route("/unlike/:postId").post(async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user;

    unlikePost(res, userId, postId);
  } catch (error) {
    sendError(res, error.message);
  }
});

router.route("/retweet/:postId").post(async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user;

    const reqdPost = await Post.findById(postId).exec();
    reqdPost.retweet.push(userId);
    await reqdPost.save();

    const populatePost = await Post.findById(postId).populate({
      path: "retweet",
      select: "name username",
    }).exec();

    const reqdPostOwnerId = await Post.findById(postId).select('userId');

    if(userId.toString() !== reqdPostOwnerId.userId.toString()) {
      const actionOwner = req.user;
      const actionType = "RETWEET";
      const owner = reqdPostOwnerId.userId;
      const newNotification = new Notification({ actionOwner, actionType, owner, postId });
      await newNotification.save();
    }

    return res.status(200).json({
      success: true,
      postId,
      userId,
      retweet: populatePost.retweet[populatePost.retweet.length - 1],
    });

  } catch(error) {
    sendError(res, error.message);
  }
})

router.route("/removeretweet/:postId").post(async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user;

    removeRetweetFromPost(res, userId, postId);
  } catch(error) {
    sendError(res, error.message);
  }
})

router.route("/addcomment/:postId").post(async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = mongoose.Types.ObjectId(req.user);
    const { comment } = req.body;
    
    let reqdPost = await Post.findOne({ _id: postId }).exec();
    const commentOwner = userId;

    reqdPost.comments.push({ comment, commentOwner, upvote:[], downvote:[] })
    await reqdPost.save();

    console.log("1",{ reqdPost });
    reqdPost = await Post.findOne({ _id: postId }).populate({ path: "comments", populate: {
        path: "commentOwner",
        model: "User"
    }}).exec();
    console.log("2",{ reqdPost });

    const reqdPostOwnerId = await Post.findById(postId).select("userId").exec();

    if(reqdPostOwnerId.userId.toString() !== userId.toString()) {
      const owner = reqdPostOwnerId.userId;
      const actionType = "COMMENT";
      const actionOwner = req.user;

      const newNotification = new Notification({ owner, actionOwner, actionType, postId });
      await newNotification.save();
    }

    return res.status(200).json({
      success: true,
      comment: reqdPost.comments[reqdPost.comments.length - 1],
      postId
    })
    
  } catch(error) {
    return sendError(res, error.message);
  }
});

router.route("/removecomment/:postId").post( async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user;
    const { commentId } = req.body;

    const reqdPost = await Post.findOne({ _id: postId }).exec();
    reqdPost.comments.pull({ commentOwner: commentId });

    await reqdPost.save();

    return res.status(200).json({
      success: true,
      postId,
      userId
    })
  } catch(error) {
    return sendError(res, error.message);
  }
});

router.route("/comment/upvote/:postId").post( async (req, res, next) => {
  try {
    const { postId } = req.params;
    const commentId = mongoose.Types.ObjectId(req.body.commentId);
    const userId = req.user;

    const alreadyDownvoted = await Post.findOne({ 'comments.downvote': userId }).exec();
    const alreadyUpvoted = await Post.findOne({ 'comments.upvote': userId }).exec();

    if(alreadyDownvoted) {
      await Post.updateOne({ 'comments._id': commentId }, { $pull: { 'comments.$.downvote': userId }}).exec();
    }

    if(alreadyUpvoted) return res.status(409).json({
      success: false,
      message: 'already upvoted'
    });

    await Post.updateOne({ 'comments._id': commentId }, { $push: { 'comments.$.upvote': userId } }).exec();

    const reqdPostOwnerId = await Post.findById(postId).select("userId").exec();
    if(reqdPostOwnerId.userId.toString() !== userId.toString()) {
      const owner = reqdPostOwnerId.userId;
      const actionType = "UPVOTE";
      const actionOwner = req.user;

      const newNotification = new Notification({ owner, actionOwner, actionType, postId });
      await newNotification.save();
    }

    return res.status(200).json({
      success: true,
      upvoteUserId: userId,
      postId,
      commentId,
    })
  } catch(error) {
    return sendError(res, error.message);
  }
});

router.route("/comment/downvote/:postId").post( async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user;
    const { commentId } = req.body;

    const alreadyDownvoted = await Post.findOne({ 'comments.downvote': userId }).exec();
    const alreadyUpvoted = await Post.findOne({ 'comments.upvote': userId }).exec();

    if(alreadyUpvoted) {
      await Post.updateOne({ 'comments._id': commentId }, { $pull: { 'comments.$.upvote': userId } }).exec();
    } 

    if(alreadyDownvoted) return res.status(409).json({
      success: false,
      message: 'already downvoted'
    });;

    await Post.updateOne({ 'comments._id': commentId }, { $push: { 'comments.$.downvote': userId } }).exec();

    return res.status(200).json({
      success: true,
      downvoteUserId: userId,
      postId,
      commentId,
    })
  } catch(error) {
    return sendError(res, error.message);
  }
})

module.exports = router;
