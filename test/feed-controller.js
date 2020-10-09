const { expect } = require("chai");
const sinon = require("sinon");
const User = require("../models/user");
const Post = require("../models/post");
const feedController = require("../controllers/feed");
const mongoose = require("mongoose");

require("dotenv").config();

describe("Feed controller:", () => {
  before((done) => {
    mongoose
      .connect(process.env.MONGO_TEST_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((result) => {
        //console.log("conect result ", result);
        const user = new User({
          email: "test@gmail.com",
          name: "test",
          password: "test",
          posts: [],
        });
        return user.save();
      })
      .then(() => done());
  });

  beforeEach(() => console.log("beforeEach"));
  afterEach(() => console.log("afterEach\n"));

  it("should add a post to the posts of the creator", (done) => {
    let userId;
    User.findOne()
      .then((user) => {
        userId = user._id;
        const req = {
          body: { title: "testtitle", content: "testcontent" },
          file: { path: "testpath" },
          userId,
        };
        const res = { status: () => {}, json: () => {} };
        return feedController.createPost(req, res, () => {});
      })
      .then((afterCreatePost) => {
        return User.findOne();
      })
      .then((user) => {
        expect(user).to.have.property("posts");
        expect(user.posts).to.have.length(1);
        console.log("user posts ", user.posts);
        done();
      });
  });

  after((done) => {
    User.deleteMany({})
      .then(() => Post.deleteMany({}))
      .then(() => mongoose.disconnect())
      .then(() => done());
  });
});
