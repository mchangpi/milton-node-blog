const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
  createUser: async ({ userInput }, req) => {
    // Use async / await in graphql
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
