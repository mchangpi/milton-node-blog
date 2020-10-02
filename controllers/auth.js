const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const signup = (req, resp, next) => {
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

module.exports = { signup };
