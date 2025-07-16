const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    username: {type: String,unique: true,index: true},
    email: {type: String,unique: true},
    password: String,
    confirmPassword: String,
    token: String,
    verified: {type:Boolean,default:false}, //For authorisation purposes 

});

const User = mongoose.model("User",UserSchema);

module.exports = User;