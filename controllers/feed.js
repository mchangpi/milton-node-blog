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
    return resp
      .status(422)
      .json({ message: "Invalid data format", errors: errors.array() });
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
    .catch((e) => console.log(e));
};

module.exports = { getPosts, createPost };
