const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Post = require("../models/post");
const io = require("../socket");

const getPosts = async (req, resp, next) => {
  const currentPage = req.query.page || 1;
  const PER_PAGE = 2;
  try {
    const totalItemsCount = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
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

const getPost = async (req, resp, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const err = new Error("Could not find post");
      err.statusCode = 404;
      throw err; // to catch below
    }
    resp.status(200).json({ message: "Post fetched.", post });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const createPost = async (req, resp, next) => {
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
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    io.getIO().emit("posts", { action: "create", post: post });

    resp.status(201).json({
      message: "Post created!",
      post,
      creator: user,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const updatePost = async (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Invalid data format");
    err.statusCode = 422;
    throw err;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  console.log("req body ", req.body);
  try {
    const post = await Post.findById(postId);
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
    const postSave = await post.save();
    resp.status(200).json({ message: "Updated", post: postSave });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const clearImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  console.log("remove old image " + fullPath);
  fs.unlink(fullPath, (err) => console.log(err));
};

const deletePost = async (req, resp, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
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
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    resp.status(200).json({ message: "Delete Post" });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
module.exports = { getPosts, getPost, createPost, updatePost, deletePost };
