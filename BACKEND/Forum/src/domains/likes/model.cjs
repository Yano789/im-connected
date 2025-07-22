const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const likedPostSchema = new Schema({
    likedPostId: {type:String,required:true},
    username:{type:String,required:true,index:true},
    createdAt:{type:Date,required:true,index:true}
})

const likedPost = mongoose.model("likedPosts",likedPostSchema)

module.exports = likedPost