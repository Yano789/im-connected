const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {allowedTags} = require("./../post/model.cjs");
const UserSchema = new Schema({
    name: String,
    username: {type: String,unique: true,index: true},
    number: {type: String, unique: true},
    email: {type: String,unique: true},
    password: String,
    verified: {type:Boolean,default:false}, //For authorisation purposes 
    threadId:   { type: String, default: null },
    preferences: {
    preferredLanguage: { type: String, default: "English" },
    textSize: { type: String, default: "Medium" },
    contentMode: { type: String, default: "Default" },
    topics: [{
    type: String,
    enum: allowedTags,
    index: true
  }],
  },

});

const User = mongoose.model("User",UserSchema);

module.exports = User;