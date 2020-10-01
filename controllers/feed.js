const { validationResult } = require("express-validator");

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
  resp.status(201).json({
    message: "Post created!",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: "Milton" },
      createdAt: new Date(),
    },
  });
};

module.exports = { getPosts, createPost };
