import express from "express";
import expressLayouts from "express-ejs-layouts";
import logger from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { APP_PORT, DB_URL } from "./config";
import { errorHandler } from "./middlewares";
import path from "path";
import session from "express-session";
import flash from "express-flash";
import http from "http";

const app = express();

const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

// const methodOverride = require("method-override");
import methodOverride from "method-override";

app.use(methodOverride());

// Database connection
mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  function (err) {
    if (err) {
      console.log(`err`, err);
      throw err;
    }
    console.log("Database Connected.");

    io.on("connection", async (socket) => {
      console.log("socket connected", socket.id);

      const db = mongoose.connection.collections["buses"];
      const findUsers = async () => {
        const users = await db.find().limit(5).sort({ _id: 1 }).toArray();
        console.log("users :>> ", users);
      };
      findUsers();
    });
  }
);

// db.on("error", console.error.bind(console, "Connection Error"));
// db.once("open", async () => {
// });

import routes from "./routes";
// import userRoutes from './routes/user';

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 15000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
// app.use(methodOverride('_method'));

// Setting logger
app.use(logger("dev"));

// Setting templating engine
app.use(expressLayouts);
app.set("view engine", "ejs");
// app.set('views', path.join(__dirname + '/views'));
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.send("hello Pawan");
});
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));
app.use("/tickets", express.static("tickets"));

app.use(express.static(path.join(__dirname, "public")));

app.use(errorHandler);

server.listen(process.env.APP_PORT || 8080, "0.0.0.0", () =>
  console.log(`Server started on port ${APP_PORT}`)
);
