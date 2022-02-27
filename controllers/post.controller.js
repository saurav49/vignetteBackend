const { Post } = require('../models/post.model.js');
const { sendError } = require("../utils");

const getAllPostByUsername = async (res, userId) => {
  try {
    const postList = await Post.find({ userId })
      .populate({
        path: "userId",
        select: "name username",
      })
      .populate({
        path: "retweet",
        select: "name username"
      })
      .populate({
        path: "likes",
        select: "name username"
      })
      .exec();

    return res.status(200).json({
      success: true,
      postList,
    });
  } catch(error) {
    sendError(res, error.message);
  }

}

const createNewPost = async (res, userId, text) => {
  try {
    const newPost = new Post({ userId, text });
    await newPost.save();

    const populateNewPost = await newPost.populate({
      path: "userId",
      select: "name username photo",
    });

    return res.status(200).json({
      success: true,
      newPost: populateNewPost,
    });
  } catch(error) {
    sendError(res, error.message);
  }
}

const getAllPost = async (req, res, followingUsers) => {
  try {
    const postList = await Post.find({
      userId: { $in: [...followingUsers.following, req.user] },
    })
      .populate({
        path: "userId",
        select: "name username",
      })
      .populate({
        path: "retweet",
        select: "name username"
      })
      .populate({
        path: "likes",
        select: "name username"
      })
      .exec();

    return res.status(200).json({
      success: true,
      postList,
    });

  } catch(error) {
    sendError(res, error.message);    
  }
}

const deletePostById = async (res, postId) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(postId).exec();

    return res.status(202).json({
      success: true,
      deletedPost,
      postId,
    });
  } catch(error) {
    sendError(res, error.message);    
  }
}

const likePost = async (res, userId, postId) => {
  try {
    const reqdPost = await Post.findById(postId).exec();
    reqdPost.likes.push(userId);

    await reqdPost.save();

    const populatePost = await Post.findById(postId).populate({
      path: "retweet",
      select: "name username",
    }).exec();

    return res.status(200).json({
      success: true,
      postId,
      userId,
      like: populatePost.likes[populatePost.likes.length - 1],
    });
  } catch(error) {
    sendError(res, error.message);    
  }
}

const unlikePost = async (res, userId, postId) => {
  try {
    const reqdPost = await Post.findById(postId).exec();
    reqdPost.likes.pull(userId);

    await reqdPost.save();

    return res.status(200).json({
      success: true,
      postId,
      userId
    });
  } catch(error) {
    sendError(res, error.message);    
  }
}

const retweetPost = async (res, userId, postId) => {
  try {
    const reqdPost = await Post.findById(postId).exec();
    reqdPost.retweet.push(userId);

    await reqdPost.save();

    const populatePost = await Post.findById(postId).populate({
      path: "retweet",
      select: "name username",
    }).exec();

    return res.status(200).json({
      success: true,
      postId,
      userId,
      retweet: populatePost.retweet[populatePost.retweet.length - 1],
    });
  } catch(error) {
    sendError(res, error.message)
  }
}

const removeRetweetFromPost = async (res, userId, postId) => {
  try {
    const reqdPost = await Post.findById(postId).exec();
    reqdPost.retweet.pull(userId);

    await reqdPost.save();

    return res.status(200).json({
      success: true,
      postId,
      userId
    });
  } catch(error) {
    sendError(res, error.message)
  }
}

const addCommentToPost = async (res) => {
  try {

  } catch(error) {
    return sendError(res, error.message);
  }
}

const removeCommentFromPost = async (res) => {
  try {

  } catch(error) {
    return sendError(res, error.message);
  }
}

module.exports = { getAllPostByUsername, createNewPost, getAllPost, deletePostById, likePost, unlikePost, retweetPost, removeRetweetFromPost, addCommentToPost, removeCommentFromPost };