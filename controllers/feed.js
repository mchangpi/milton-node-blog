const getPosts = (req, resp, next) => {
  resp.status(200).json({
    posts: [
      { title: "1st post", content: "content 1" },
      { title: "2nd post", content: "content 2" },
    ],
  });
};

const createPost = (req, resp, next) => {
  const { title, content } = req.body;
  resp.status(201).json({
    message: "Post created!",
    post: { id: new Date().toISOString(), title, content },
  });
};

module.exports = { getPosts, createPost };
