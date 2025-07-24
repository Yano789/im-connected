require("dotenv").config();
const mongoose = require("mongoose");

//uri
const {MONGODB_URI} = process.env;

const connectToDB = async()=>{
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // Timeout after 30s
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: "majority"
        });
        console.log("DB Connected");
        
        // Test the connection
        await mongoose.connection.db.admin().ping();
        console.log("Database ping successful");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        if (error.name === 'MongoServerSelectionError') {
            console.log("This might be a macOS DNS resolution issue. Please check:");
            console.log("1. Your IP address is whitelisted in MongoDB Atlas");
            console.log("2. You have internet connectivity");
            console.log("3. The MongoDB Atlas cluster is running");
        }
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== "test") {
    connectToDB();
}
