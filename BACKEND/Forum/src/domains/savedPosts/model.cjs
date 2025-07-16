const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const savedPostSchema = new Schema({
    savedPostId: {type:String,required:true},
    username:{type:String,required:true,index:true},
    createdAt:{type:Date,required:true,index:true}

});

const savedPost = mongoose.model("savedPosts",savedPostSchema);

module.exports = savedPost;