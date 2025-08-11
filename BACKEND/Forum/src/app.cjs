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

// CSP configuration to fix Railway security policy issues
const CSP_STRING = "default-src 'self' https:; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU=' https: blob:; " +
  "style-src 'self' 'unsafe-inline' https:; " +
  "img-src 'self' data: https: blob:; " +
  "font-src 'self' https: data:; " +
  "connect-src 'self' https: wss: ws:; " +
  "media-src 'self' https: blob:; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "frame-ancestors 'none';";

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

// Content Security Policy middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP_STRING);
  next();
});

app.use(bodyParser());

// Serve static files from the public directory (built frontend)
if (process.env.NODE_ENV === "production") {
  // In Docker, working directory is /app and frontend files are in /app/public
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));
  
  // Debug: Log the public directory path
  console.log("Working directory:", process.cwd());
  console.log("Serving static files from:", publicPath);
  console.log("Looking for index.html at:", path.join(publicPath, "index.html"));
}

app.use("/api/v1",routes);

// Serve frontend for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get(/^(?!\/api).*/, (req, res) => {  // Matches everything except /api routes
    const indexPath = path.join(process.cwd(), "public", "index.html");
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