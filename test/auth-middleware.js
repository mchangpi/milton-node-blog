const { expect } = require("chai");
const authMiddleware = require("../middleware/is-auth");
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

describe("Auth middleware: ", () => {
  it("should throw an error if no authorization header is present", () => {
    const req = {
      get: () => {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated"
    );
  });

  it("should throw an error if the authorization header is only one string", () => {
    const req = {
      get: () => {
        return "bearer ";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should yield an userId after decoding the token.", () => {
    const req = {
      get: () => {
        return "bearer blablablabla ";
      },
    };
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });

    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId", "abc");
    expect(jwt.verify.called).to.be.true;

    jwt.verify.restore();
  });

  it("should throw an error if the token cannot be verified", () => {
    const req = {
      get: () => {
        return "bearer xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
