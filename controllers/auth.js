const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const putSignup = async (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation Failed");
    err.statusCode = 422;
    err.data = errors.array();
    throw err;
  }
  const { email, password, name } = req.body;
  console.log("req body ", req.body);
  try {
    const hashedPW = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      name,
      password: hashedPW,
    });
    const userSave = await user.save();
    resp.status(201).json({ message: "User created", userId: userSave._id });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const postLogin = async (req, resp, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 401;
      throw err;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const err = new Error("Wrong password");
      err.statusCode = 401;
      throw err;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "setPrivateKey",
      { expiresIn: "1h" }
    );
    resp.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const getUserStatus = async (req, resp, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    resp.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const patchUserStatus = async (req, resp, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    user.status = req.body.status;
    await user.save();
    resp.status(200).json({ message: "User updated" });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
module.exports = { putSignup, postLogin, getUserStatus, patchUserStatus };
