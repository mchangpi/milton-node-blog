const express = require("express");
const feedController = require("../controllers/feed");
const router = express.Router();
const { body } = require("express-validator");

const checkInputs = [
  body("title").trim().isLength({ min: 5 }),
  body("content").trim().isLength({ min: 5 }),
];

router.get("/posts", feedController.getPosts);
router.get("/post/:postId", feedController.getPost);

router.post("/post", checkInputs, feedController.createPost);

router.put("/post/:postId", checkInputs, feedController.updatePost);

router.delete("/post/:postId", checkInputs, feedController.deletePost);

module.exports = router;
