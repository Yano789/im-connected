const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
postId: { type: String, required: true, unique: true, index: true }, // index + unique
  title: { type: String },
  content: { type: String },
  username: { type: String, required: true, index: true },             // index for filtering by user
  tag: { type: String, index: true },                                  // index if you want to search/filter by tag
  createdAt: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  saved: { type: Boolean, default: false }

});

const Post = mongoose.model("Post",PostSchema);

module.exports = Post;