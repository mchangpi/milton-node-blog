const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Post = require("../models/post");

require("dotenv").config();

module.exports = {
  createUser: async ({ userInput }, req) => {
    // Use async / await in graphql
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Email is invalid." });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password too short." });
    }
    if (errors.length > 0) {
      const err = new Error("Invalid input format. " + errors[0].message);
      err.data = errors;
      err.code = 422;
      throw err;
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error("User exists already");
    }
    const hashedPW = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPW,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async ({ email, password }, req) => {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.code = 401;
      throw err;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const err = new Error("Wrong Password.");
      err.code = 401;
      throw err;
    }
    const token = await jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.SESSION_SECRET,
      { expiresIn: "1h" }
    );
    return { token, userId: user._id.toString() };
  },
  createPost: async ({ postInput }, req) => {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated.");
      err.code = 401;
      throw err;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title should have at least 5 characters" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content should have at least 5 characters" });
    }
    if (errors.length > 0) {
      const err = new Error("Invalid input format. " + errors[0].message);
      err.data = errors;
      err.code = 422;
      throw err;
    }
    const { title, content, imageUrl } = postInput;
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error("Invalid user.");
      err.code = 401;
      throw err;
    }
    const post = new Post({
      title,
      content,
      imageUrl,
      creator: user,
    });
    const mongoPost = await post.save();
    user.posts.push(mongoPost);
    await user.save();

    return {
      ...mongoPost._doc,
      _id: mongoPost._id.toString(),
      createdAt: mongoPost.createdAt.toISOString(),
      updatedAt: mongoPost.updatedAt.toISOString(),
    };
  },
  getPosts: async ({ page }, req) => {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated.");
      err.code = 401;
      throw err;
    }
    if (!page) page = 1;
    console.log("page ", page);
    const PER_PAGE = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .populate("creator");
    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalPosts,
    };
  },
  getPost: async ({ id }, req) => {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated.");
      err.code = 401;
      throw err;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const err = new Error("No Post found");
      err.code = 404;
      throw err;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
};
