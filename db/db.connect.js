const mongoose = require("mongoose");
var cloudinary = require('cloudinary').v2;
require("dotenv").config({ path: "../test.env" });

const connectToDb = async () => {
  try {
    const response = await mongoose.connect(process.env.DATABSE_URL);

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY ,
      api_secret: process.env.CLOUD_API_SECRET,
    });
    
    console.log("Connection Successful To The MongoDB Backend");
  } catch (error) {
    console.log("Something went wrong with the mongoDB connection", error);
  }
};

module.exports = { connectToDb, cloudinary };
