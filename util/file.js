const path = require("path");
const fs = require("fs");
const clearImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  console.log("remove old image " + fullPath);
  fs.unlink(fullPath, (err) => {
    if (err) console.log(err);
  });
};

module.exports = clearImage;
