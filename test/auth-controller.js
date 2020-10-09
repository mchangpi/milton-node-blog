const { expect } = require("chai");
const sinon = require("sinon");
const User = require("../models/user");
const authController = require("../controllers/auth");

describe("Auth controller - ", () => {
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
});
