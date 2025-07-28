const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const allowedTags = ['Physical Disability & Chronic Illness', 'Personal Mental Health', 'End of Life Care', 'Financial & Legal Help', 'Mental Disability','Hospitals and Clinics','Pediatric Care','Subsidies and Govt Support'];
const PostSchema = new Schema({
postId: { type: String, unique: true, index: true }, 
  title: { type: String, unique: true },
  content: { type: String },
  username: { type: String, index: true },           
  tags: [{
    type: String,
    enum: allowedTags,
    index: true
  }],                                 
  createdAt: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  comments: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  draft:{type:Boolean,default:false},
  media:[{
    url:{type:String,required:true},
    type:{type:String,required:true,enum:["image","video"]},
    public_id:{type:String,required:true} //for deleting from cloudinary
  }]
});

PostSchema.path('tags').validate(function (value) {
  return value.length <= 2;
}, 'A post can have at most 2 tags.');

const Post = mongoose.model("Post",PostSchema);

module.exports = {Post,allowedTags};