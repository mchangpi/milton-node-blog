const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const putSignup = (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation Failed");
    err.statusCode = 422;
    err.data = errors.array();
    throw err;
  }
  const { email, password, name } = req.body;
  console.log("req body ", req.body);
  bcrypt
    .hash(password, 12)
    .then((hashedPW) => {
      const user = new User({
        email,
        name,
        password: hashedPW,
      });
      return user.save();
    })
    .then((result) => {
      resp.status(201).json({ message: "User created", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const postLogin = (req, resp, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const err = new Error("User not found");
        err.statusCode = 401;
        throw err;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const err = new Error("Wrong password");
        err.statusCode = 401;
        throw err;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "setPrivateKey",
        { expiresIn: "1h" }
      );
      resp.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

module.exports = { putSignup, postLogin };
