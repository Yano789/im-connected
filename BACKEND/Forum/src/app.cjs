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
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:80",   // Docker frontend
    "http://localhost",      // Docker frontend (without port)
    "http://localhost:3000", // Alternative dev port
    "http://localhost:8080"  // Nginx proxy
  ],
  credentials: true                // This is REQUIRED for cookies to work
}));
app.use(bodyParser());
app.use("/api/v1",routes);

module.exports = app;