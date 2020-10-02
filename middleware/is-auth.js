const jwt = require("jsonwebtoken");

const isAuth = (req, resp, next) => {
  const header = req.get("Authorization");
  if (!header) {
    const err = new Error("Not authenticated");
    err.statusCode = 401;
    throw err;
  }
  const token = header.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "setPrivateKey");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const err = new Error("Not authenticated");
    err.statusCode = 401;
    throw err;
  }
  req.userId = decodedToken.userId;
  next();
};

module.exports = isAuth;
