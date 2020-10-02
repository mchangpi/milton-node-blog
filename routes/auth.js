const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");

const checkSignup = [
  body("email", "Please input a valid email")
    .trim()
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("This email is already registered");
        }
      });
    })
    .normalizeEmail(),
  body("password", "Password should be at least 5 characters")
    .trim()
    .isLength({ min: 5 }),
  body("name").trim().not().isEmpty(),
];

router.put("/signup", checkSignup, authController.signup);

module.exports = router;
