const Comment = require("./model")
const {hashData} = require("../../utils/hashData");
const User = require("../user/model")

const createComment = async(data)=>{
    try {
        const{postId,parentCommentId,username,content} = data
        const existingUsername = await User.findOne({username})
        if(!existingUsername){
            throw Error("Username does not exist")
        }
        else{
            const createCommentId = await hashData(username+Date.now().toLocaleString())
            const newComment = new Comment({
                commentId:createCommentId,
                postId:postId,
                parentCommentId:parentCommentId,
                username:username,
                content:content,
                createdAt:Date.now()
            })
            const createdComment = await newComment.save()
            return createdComment
        }

        
    } catch (error) {
        throw error
    }
}

const editComment =async(data)=>{
    try {
        const {commentId,newContent} = data
        const existingComment = await Comment.findOne({commentId})
        if(!existingComment){
            throw Error("Comment does not exist!")

        }else{
            const editedContent = newContent==null? existingComment.content:newContent
            await Comment.updateOne({commentId},{content:editedContent,createdAt:Date.now(),edited:true})
            const existingEditedComment = await Comment.findOne({commentId})
            return existingEditedComment
        }
    } catch (error) {
        throw error
    }
}


const deleteComment = async(data) => {
    try {
        const commentId = data
        const existingComment = await Comment.findOne({commentId})
        if(!existingComment){
            throw Error("Comment does not exist!")

        }else{
            const replacementParentCommentIdIfnested = existingComment.parentCommentId == null ? null : existingComment.parentCommentId
            //checks if it is a top level comment, if it is then change the parent comment id of the comment below it to be null
            //if it is a nested, change the parent comment id of the next nested comment to be the predecessor's comment id
            await Comment.deleteOne({commentId},{content:"deleted",createdAt:Date.now()})
            await Comment.updateMany({parentCommentId:commentId},{parentCommentId:replacementParentCommentIdIfnested})
            return existingComment
        }
    } catch (error) {
        throw error
    }
}


//builds nested structure for comments
function buildCommentTree(comments) {
  const map = new Map();

  comments.forEach(comment => {
    comment.children = [];
    map.set(comment.commentId, comment);
  });

  const roots = [];

  comments.forEach(comment => {
    if (comment.parentCommentId) {
      const parent = map.get(comment.parentCommentId);
      if (parent) {
        console.log(`Attaching comment ${comment.commentId} to parent ${parent.commentId}`);
        parent.children.push(comment);
      } else {
        console.log(`Parent ${comment.parentCommentId} not found for comment ${comment.commentId}`);
        roots.push(comment);
      }
    } else {
      roots.push(comment);
    }
  });

  return roots;
}






const getAllComments = async(postId) => {
  try {
    const allComments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();
    const nestedComments = buildCommentTree(allComments);
    console.log(JSON.stringify(nestedComments, null, 2));

    return nestedComments;
  } catch (error) {
    throw error;
  }
}


module.exports = {createComment,editComment,deleteComment,getAllComments}