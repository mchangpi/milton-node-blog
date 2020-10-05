const jwt = require("jsonwebtoken");
require("dotenv").config();

const isAuth = (req, resp, next) => {
  req.isAuth = false;
  const header = req.get("Authorization");
  if (!header) {
    return next();
  }
  const token = header.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SESSION_SECRET);
  } catch (err) {
    return next();
  }
  if (!decodedToken) {
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};

module.exports = isAuth;
