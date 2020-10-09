const { expect } = require("chai");
const sinon = require("sinon");
const User = require("../models/user");
const authController = require("../controllers/auth");
const mongoose = require("mongoose");

require("dotenv").config();

describe("Auth controller:", () => {
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

  it("should throw error code 500 if accessing database failed", (done) => {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: { email: "test@test.com", password: "test" },
    };
    authController
      .postLogin(req, {}, () => {})
      .then((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("statusCode", 500);
        done();
      });

    User.findOne.restore();
  });

  it("should send a response with a valid user status for any existing user", (done) => {
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    User.findOne()
      .then((user) => {
        console.log("user._id ", user._id.toString());
        return authController.getUserStatus(
          { userId: user._id },
          res,
          () => {}
        );
      })
      .then(() => {
        console.log("statusCode ", res.statusCode);
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal("Hello, I am new user");
        done();
      })
      .catch((e) => console.log(e));
  });

  after((done) => {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => done());
  });
});
