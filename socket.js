let io;

const initSocket = (httpSeriver) => {
  io = require("socket.io")(httpSeriver);
  return io;
};

const getIO = () => {
  if (!io) throw new Error("No socket io");
  return io;
};

module.exports = { initSocket, getIO };
