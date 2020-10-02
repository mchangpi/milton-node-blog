const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Post = require("../models/post");

const getPosts = async (req, resp, next) => {
  const currentPage = req.query.page || 1;
  const PER_PAGE = 2;
  try {
    const totalItemsCount = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * PER_PAGE)
      .limit(PER_PAGE);
    resp.status(200).json({
      message: "Fetched posts successfully",
      posts,
      totalItems: totalItemsCount,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
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
  const { title, content } = req.body;
  let creator;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId,
  });
  post
    .save()
    .then((afterPostSave) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((afterUserSave) => {
      console.log(afterUserSave);
      resp.status(201).json({
        message: "Post created!",
        post,
        creator,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const updatePost = (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Invalid data format");
    err.statusCode = 422;
    throw err;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  console.log("req body ", req.body);
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error("Not find post");
        err.statusCode = 404;
        throw err; // throw to catch
      }
      if (post.creator.toString() !== req.userId) {
        const err = new Error("Not authorized");
        err.statusCode = 403;
        throw err;
      }
      post.title = title;
      if (req.file) {
        clearImage(post.imageUrl);
        post.imageUrl = req.file.path;
      }
      post.content = content;
      return post.save();
    })
    .then((result) =>
      resp.status(200).json({ message: "Updated", post: result })
    )
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const clearImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  console.log("remove old image " + fullPath);
  fs.unlink(fullPath, (err) => console.log(err));
};

const deletePost = (req, resp, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error("Not find post");
        err.statusCode = 404;
        throw err; // throw to catch
      }
      if (post.creator.toString() !== req.userId) {
        const err = new Error("Not authorized");
        err.statusCode = 403;
        throw err;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((afterRemovePost) => {
      console.log("result ", afterRemovePost);
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((afterUserSave) => {
      resp.status(200).json({ message: "Delete Post" });
    })
    .catch((e) => {
      if (!e.statusCode) e.statusCode = 500;
      next(e);
    });
};
module.exports = { getPosts, getPost, createPost, updatePost, deletePost };
