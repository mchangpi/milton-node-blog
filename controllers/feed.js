const { validationResult } = require("express-validator");
const Post = require("../models/post");

const getPosts = (req, resp, next) => {
  resp.status(200).json({
    posts: [
      {
        _id: 1,
        title: "1st post",
        content: "content 1",
        imageUrl: "images/book.jpg",
        creator: {
          name: "Milton",
        },
        createdAt: new Date(),
      },
    ],
  });
};

const createPost = (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Invalid data format");
    err.statusCode = 422;
    throw err;
    /*
    return resp
      .status(422)
      .json({ message: "Invalid data format", errors: errors.array() });
	*/
  }

  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imageUrl: "images/book.jpg",
    creator: { name: "Milton" },
  });
  post
    .save()
    .then((result) => {
      console.log(result);
      resp.status(201).json({
        message: "Post created!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

module.exports = { getPosts, createPost };
