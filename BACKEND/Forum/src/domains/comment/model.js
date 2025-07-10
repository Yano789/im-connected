const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    commentId: {type:String,unique:true},
    postId:{type:String,required:true,index:true}, //Each comment will relate to a postId
    parentCommentId:{type:String,default:null,index:true}, //Each comment can be either a top level comment so is null parentCommentId or nested 
    username:{type:String,required:true},
    content:{type:String,required:true},
    createdAt:{type:Date,default:Date.now()},
    edited:{type:Boolean,default:false}
})

const Comment = mongoose.model("Comment",CommentSchema)

module.exports = Comment;