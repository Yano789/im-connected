const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    username: {type: String,unique: true,index: true},
    number: {type: String, unique: true},
    email: {type: String,unique: true},
    password: String,
    verified: {type:Boolean,default:false}, //For authorisation purposes 
    preferences: {
    preferredLanguage: { type: String, default: "English" },
    textSize: { type: String, default: "Medium" },
    contentMode: { type: String, default: "Default" },
    topics: { type: [String], default: [] },
  },

});

const User = mongoose.model("User",UserSchema);

module.exports = User;