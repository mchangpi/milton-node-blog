const { validationResult } = require("express-validator");
const Post = require("../models/post");

const getPosts = (req, resp, next) => {
  Post.find()
    .then((posts) => {
      resp.status(200).json({ message: "Fetched posts successfully", posts });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const getPost = (req, resp, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error("Could not find post");
        err.statusCode = 404;
        throw err; // to catch below
      }
      resp.status(200).json({ message: "Post fetched.", post });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const createPost = (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Invalid data format");
    err.statusCode = 422;
    throw err;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  console.log("req file ", req.file);

  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: { name: "Milton" },
  });
  post
    .save()
    .then((result) => {
      console.log(result);
      resp.status(201).json({
        message: "Post created!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

module.exports = { getPosts, getPost, createPost };
