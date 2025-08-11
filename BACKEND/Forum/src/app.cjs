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

// Serve static files from the public directory (built frontend) - BEFORE API routes
if (process.env.NODE_ENV === "production") {
  // In Docker, working directory is /app and frontend files are in /app/public
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));
  
  // Debug: Log the public directory path
  console.log("Working directory:", process.cwd());
  console.log("Serving static files from:", publicPath);
  console.log("Looking for index.html at:", path.join(publicPath, "index.html"));
}

// Health check endpoint for Railway
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Root route - serve index.html
app.get("/", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    const indexPath = path.join(process.cwd(), "public", "index.html");
    console.log("Serving root route - index.html from:", indexPath);
    res.sendFile(indexPath);
  } else {
    res.json({ message: "IM-CONNECTED Development Server" });
  }
});

app.use("/api/v1",routes);

// Serve frontend for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get(/^(?!\/api).*/, (req, res) => {  // Matches everything except /api routes
    const indexPath = path.join(process.cwd(), "public", "index.html");
    console.log("SPA fallback route hit for:", req.url);
    console.log("Attempting to serve index.html from:", indexPath);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(404).send("Frontend file not found");
      }
    });
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