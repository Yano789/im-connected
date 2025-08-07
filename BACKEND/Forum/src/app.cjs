//mongodb
if (process.env.NODE_ENV !== "test") {
  require("./config/db.cjs");
}

const express = require("express");
const bodyParser = express.json;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
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
    "http://localhost:8080", // Nginx proxy
    "http://localhost:5001", // Backend dev server (for frontend calling backend locally)
    /^https:\/\/.*\.railway\.app$/, // Railway deployments
    "https://imconnected-production.up.railway.app", // Your specific Railway app
  ],
  credentials: true,                // This is REQUIRED for cookies to work
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));
app.use(bodyParser());

// Serve static files from the public directory (built frontend)
if (process.env.NODE_ENV === "production") {
  // In Docker, files are copied to ./public relative to the working directory (/app)
  const publicPath = path.join(__dirname, "../../public");
  app.use(express.static(publicPath));
  
  // Debug: Log the public directory path
  console.log("Serving static files from:", publicPath);
  console.log("Looking for index.html at:", path.join(publicPath, "index.html"));
}

app.use("/api/v1",routes);

// Serve frontend for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    const indexPath = path.join(__dirname, "../../public/index.html");
    console.log("Attempting to serve index.html from:", indexPath);
    res.sendFile(indexPath);
  });
}

app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;