require("dotenv").config();
const mongoose = require("mongoose");

//uri
const {MONGODB_URI} = process.env;

const connectToDB = async () => {
  if (process.env.NODE_ENV === "test") {
    throw new Error("❌ connectToDB() should not run during tests!");
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: "majority",
    });
    console.log("DB Connected");
    await mongoose.connection.db.admin().ping();
    console.log("Database ping successful");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
    connectToDB();
}
