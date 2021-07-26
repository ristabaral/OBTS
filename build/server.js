"use strict";

var _express = _interopRequireDefault(require("express"));

var _expressEjsLayouts = _interopRequireDefault(require("express-ejs-layouts"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _config = require("../config");

var _middlewares = require("../middlewares");

var _path = _interopRequireDefault(require("path"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _expressFlash = _interopRequireDefault(require("express-flash"));

var _methodOverride = _interopRequireDefault(require("method-override"));

var _routes = _interopRequireDefault(require("../routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])(); // const methodOverride = require("method-override");

app.use((0, _methodOverride["default"])()); // Database connection

_mongoose["default"].connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

var db = _mongoose["default"].connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", function () {
  return console.log("DB Connected..");
});
// import userRoutes from './routes/user';
global.appRoot = _path["default"].resolve(__dirname);
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use(_express["default"].json());
app.use((0, _cookieParser["default"])());
app.use((0, _expressSession["default"])({
  secret: "secret",
  cookie: {
    maxAge: 15000
  },
  resave: false,
  saveUninitialized: false
}));
app.use((0, _expressFlash["default"])()); // app.use(methodOverride('_method'));
// Setting logger

app.use((0, _morgan["default"])("dev")); // Setting templating engine

app.use(_expressEjsLayouts["default"]);
app.set("view engine", "ejs"); // app.set('views', path.join(__dirname + '/views'));

app.set("views", _path["default"].join(__dirname, "views"));
app.use("/api", _routes["default"]);
app.use("/uploads", _express["default"]["static"]("uploads"));
app.use("/tickets", _express["default"]["static"]("tickets"));
app.get("/", function (req, res) {
  res.send("hello Pawan");
});
app.use(_express["default"]["static"](_path["default"].join(__dirname, "public")));
app.use(_middlewares.errorHandler); // app.listen(APP_PORT, () => console.log(`Server started on PORT ${APP_PORT}`));

app.listen(process.env.APP_PORT || 8080, "0.0.0.0", function () {
  return console.log("Server started on port ".concat(_config.APP_PORT));
});
//# sourceMappingURL=server.js.map