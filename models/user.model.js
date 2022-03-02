const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Name is Required",
    },

    username: {
      type: String,
      trim: true,
      unique: true,
      required: "Username is Required",
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      required: "Email is Required",
    },

    password: {
      type: String,
      trim: true,
      required: "Password is Required",
    },

    bio: {
      type: String,
      trim: true,
      maxLength: [280, "Bio should be under 280 characters"],
    },

    website: {
      type: String,
      trim: true,
    },

    photo: {
      id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { versionKey: false },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
