//mongodb
require("./config/db.cjs");
const express = require("express");
const bodyParser = express.json;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes/index.cjs");

//create server app
const app = express();

//middleware
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true                // This is REQUIRED for cookies to work
}));
app.use(bodyParser());
app.use("/api/v1",routes);

module.exports = app;