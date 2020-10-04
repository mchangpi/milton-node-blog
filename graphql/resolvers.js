const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
  createUser: async ({ userInput }, req) => {
    // Use async / await in graphql
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ msg: "Email is invalid." });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ msg: "Password too short." });
    }
    if (errors.length > 0) {
      const err = new Error("Invalid input format");
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
};
