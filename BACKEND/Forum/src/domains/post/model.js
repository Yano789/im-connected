const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    postId: {type:String,unique:true},
    title: String,
    content: String,
    username:String,
    tag: String,
    createdAt:{type: Date, default:Date.now()},
    edited:{type:Boolean,default:false},

});

const Post = mongoose.model("Post",PostSchema);

module.exports = Post;