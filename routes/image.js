const express = require("express");
const imageRouter = express.Router();
const mongoose = require("mongoose");
const Image = require("../models/image");
require("dotenv").config();

let gfs;

const getRoutes = (upload) => {
  const url = process.env.MONGO_URL; //config.mongoURI;
  const connect = mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connect.once("open", () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
      bucketName: "uploads",
    });
  });
  /* POST: Upload a single image/file to Image collection
   */
  imageRouter.route("/").put(upload.single("image"), (req, resp, next) => {
    if (!req.file) {
      return resp.status(200).json({ success: true, image: null });
    }

    if (req.body.oldPath) {
      clearImage(req.body.oldPath);
    }

    new Image({
      fileId: req.file.id,
      filename: req.file.filename,
    })
      .save()
      .then((image) => {
        resp.status(200).json({
          success: true,
          image,
        });
      })
      .catch((err) => resp.status(500).json(err));
  });

  /* GET: Fetches a particular image and render on browser
   */
  imageRouter.route("/:filename").get((req, resp, next) => {
    gfs.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files[0] || files.length === 0) {
        return resp.status(200).json({
          success: false,
          message: "No files available",
        });
      }
      // console.log("filename ", req.params.filename);
      // render image to browser
      gfs.openDownloadStreamByName(req.params.filename).pipe(resp);
    });
  });
  return imageRouter;
};

const clearImage = async (imageUrl) => {
  const image = await Image.findOne({ filename: imageUrl });
  console.log("remove image ", image.filename);
  await gfs.delete(new mongoose.Types.ObjectId(image.fileId), (err, data) => {
    if (err) throw new Error("delete old image file failed");
  });
  await image.remove((err) => {
    if (err) throw new Error("delete old image document failed");
  });
};

/* 
	//DELETE: Delete a particular file by an ID
  imageRouter.route("/file/del/:id").post((req, res, next) => {
    console.log(req.params.id);
    gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
      if (err) {
        return res.status(404).json({ err: err });
      }

      res.status(200).json({
        success: true,
        message: `File with ID ${req.params.id} is deleted`,
      });
    });
  });
  // GET: Delete an image from the collection
  imageRouter.route("/delete/:id").get((req, res, next) => {
    Image.findOne({ _id: req.params.id })
      .then((image) => {
        if (image) {
          Image.deleteOne({ _id: req.params.id })
            .then(() => {
              return res.status(200).json({
                success: true,
                message: `File with ID: ${req.params.id} deleted`,
              });
            })
            .catch((err) => {
              return res.status(500).json(err);
            });
        } else {
          res.status(200).json({
            success: false,
            message: `File with ID: ${req.params.id} not found`,
          });
        }
      })
      .catch((err) => res.status(500).json(err));
  });*/

module.exports = { getRoutes, clearImage };
