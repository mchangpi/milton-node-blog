const express = require("express");
const feedController = require("../controllers/feed");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const checkInputs = [
  body("title").trim().isLength({ min: 5 }),
  body("content").trim().isLength({ min: 5 }),
];

router.get("/posts", isAuth, feedController.getPosts);
router.get("/post/:postId", isAuth, feedController.getPost);

router.post("/post", isAuth, checkInputs, feedController.createPost);

router.put("/post/:postId", isAuth, checkInputs, feedController.updatePost);

router.delete("/post/:postId", isAuth, checkInputs, feedController.deletePost);

module.exports = router;
