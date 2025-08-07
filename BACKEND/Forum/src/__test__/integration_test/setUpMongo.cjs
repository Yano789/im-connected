const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
// Load environment variables from .env.test
dotenv.config({
  path: path.resolve(__dirname, "../../__test__/integration_test/.env.test")
});
console.log("[DEBUG] Loading env from:", path.resolve(__dirname, "../../__test__/integration_test/.env.test"));
if (process.env.NODE_ENV !== "test") {
  throw new Error("❌ You are running tests in a non-test environment. Aborting.");
}
beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_URI is not defined in .env.test");
  }
console.log("Connecting to MongoDB at:", process.env.MONGODB_URI);
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ Connected to test MongoDB");
  console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Mongo URI:", process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log("Mongoose connected to", mongoose.connection.host, mongoose.connection.name);
});
});

afterAll(async () => {

  await mongoose.disconnect();
  console.log("🛑 Disconnected from test MongoDB");
});
