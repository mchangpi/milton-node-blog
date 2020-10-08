const { expect } = require("chai");
const authMiddleware = require("../middleware/is-auth");

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
});
