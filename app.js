const express = require("express");
const feedRoutes = require("./routes/feed");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
