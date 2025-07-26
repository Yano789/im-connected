const Comment = require("./model.cjs")
const {hashData} = require("../../utils/hashData.cjs");
const User = require("../user/model.cjs")
const {Post} = require("../post/model.cjs")
const createNestedComment = require("../../utils/buildNestedComments.cjs")


const createComment = async (data) => {
    try {
        const { postId, parentCommentId, username, content } = data
        const existingUsername = await User.findOne({ username })
        if (!existingUsername) throw new Error("Username does not exist");
        const postUpdate = await Post.updateOne({ postId }, { $inc: { comments: 1 } })
        if (postUpdate.matchedCount === 0) throw new Error("Post not found");

        const createCommentId = await hashData(username + Date.now().toLocaleString())
        const newComment = new Comment({
            commentId: createCommentId,
            postId: postId,
            parentCommentId: parentCommentId,
            username: username,
            content: content,
            createdAt: Date.now()
        })
        const createdComment = await newComment.save()
        if(!createdComment){
            throw Error ("Created Comment does not exist")
        }
        return createdComment

    } catch (error) {
        throw error
    }
}

const editComment = async (data) => {
    try {
        const { commentId, content,username } = data
        const existingComment = await Comment.findOne({commentId})
        if (!existingComment) throw new Error("Comment not found")
        if(existingComment.username !== username) throw new Error("Invalid User!");
        const existingEditedComment = await Comment.findOneAndUpdate({ commentId }, { content: content, createdAt: Date.now(), edited: true },{ new: true })
        if (!existingEditedComment) {
            throw Error("Updated comment does not exist!")

        }
        return existingEditedComment

    } catch (error) {
        throw error
    }
}


const deleteComment = async (data) => {
    try {
        const { postId, commentId, username } = data
        const existingComment = await Comment.findOne({ commentId })
        if (!existingComment) {
            throw Error("Comment does not exist!")

        }
        else if (existingComment.username !== username) throw new Error("Invalid User!");

        else {
            const replacementParentCommentIdIfnested = existingComment.parentCommentId == null ? null : existingComment.parentCommentId
            //checks if it is a top level comment, if it is then change the parent comment id of the comment below it to be null
            //if it is a nested, change the parent comment id of the next nested comment to be the predecessor's comment id
            await Comment.updateMany(
                { parentCommentId: commentId },
                { parentCommentId: replacementParentCommentIdIfnested }
            );

            await Comment.deleteOne({ commentId });

            await Post.updateOne({ postId }, { $inc: { comments: -1 } });
            return existingComment
        }
    } catch (error) {
        throw error
    }
}


const getAllComments = async(postId) => {
  try {
    const allComments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();
    const nestedComments = await createNestedComment(allComments);
    console.log(JSON.stringify(nestedComments, null, 2));

    return nestedComments;
  } catch (error) {
    throw error;
  }
}

const getComment = async (data) => {
    try {
        const { postId, commentId} = data
        if (!postId) {
            throw Error("No postId")
        }
        if (!commentId) {
            throw Error("No commentId")
        }
        const comment = await Comment.findOne({ postId: postId, commentId: commentId })
        if (!comment) {
            throw Error("No such comment found")
        }
        return comment

    } catch (error) {
        throw error
    }
}

module.exports = {createComment,editComment,deleteComment,getAllComments,getComment}