const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const isAuth = require("./middleware/graphql-auth");
const helmet = require("helmet");
const compression = require("compression");
const { getRoutes } = require("./routes/image");
const GridFsStorage = require("multer-gridfs-storage");
const crypto = require("crypto");

require("dotenv").config();

const app = express();

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
//app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "client/build")));
app.use(helmet());
app.use(compression());

app.use((req, resp, next) => {
  resp.setHeader("Access-Control-Allow-Origin", "*");
  resp.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return resp.sendStatus(200);
  }
  next();
});

app.use(isAuth);
/*
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});*/
const storage = new GridFsStorage({
  url: process.env.MONGO_URL, //config.mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + "-" + file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage, fileFilter });
app.use("/image", getRoutes(upload));

/*
app.put("/put-image", (req, resp, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  if (!req.file) {
    return resp.status(200).json({ message: "No file provided" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return resp
    .status(201)
    .json({ message: "File Stored", filePath: req.file.path });
});
*/

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "Error from Resolver";
      const status = err.originalError.code || 500;
      return { message, status, data };
    },
  })
);

app.use((error, req, resp, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  resp.status(status).json({ message, data });
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log("Node listens on ", port);
    });
    /* const io = require("./socket").initSocket(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
		}); */
  })
  .catch((e) => console.log(e));
