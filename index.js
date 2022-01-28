const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "./test.env" });
const { connectToDb } = require("./db/db.connect");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

connectToDb();

const { errorHandler } = require("./middlewares/errorHandler");
const { routeHandler } = require("./middlewares/routeHandler");

const userRouter = require("./routes/user.route");
const postRouter = require("./routes/post.route");
const notificationRouter = require("./routes/notification.route");

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome Abroad",
  });
});

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/notification", notificationRouter);

// ERROR HANDLER
app.use(errorHandler);

// ROUTE HANDLER
app.use(routeHandler);

app.listen(process.env.PORT, () => {
  console.log("Vignette Backend Server Started!");
});
