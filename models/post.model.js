const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  text: {
    type: String,
    required: "Text is Required",
  },

  postPhoto: {
      id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
  },

  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  retweet: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  comments: [
    {
      commentOwner: { type: Schema.Types.ObjectId, ref: "User" },
      comment: { type: String, required: "Comment is Required" },
      upvote: [{ type: Schema.Types.ObjectId, ref: "User" }],
      downvote: [{ type: Schema.Types.ObjectId, ref: "User" }],
      createdAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true }, { versionKey: false });

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
