const path = require("path");
const express = require("express");
const feedRoutes = require("./routes/feed");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

require("dotenv").config();

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, resp, next) => {
  resp.setHeader("Access-Control-Allow-Origin", "*");
  resp.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use((error, req, resp, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  resp.status(status).json({ message });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then((result) => {
    app.listen(8080, () => {
      console.log("Node listens on 8080..");
    });
  })
  .catch((e) => console.log(e));
