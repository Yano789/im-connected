// CommentBody.jsx
import "./CommentBody.css";
import CommentEntry from "../CommentEntry/CommentEntry";
import { useState, useEffect } from "react";

function CommentBody({ comments = [], postId, refreshComments }) {
  const [commentInput, setCommentInput] = useState("");

  const handlePostComment = async () => {
    if (!commentInput.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/v1/${encodeURIComponent(postId)}/comment/create`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: commentInput,
            parentCommentId: null,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to post comment");
      await refreshComments();
      setCommentInput("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDeleteComment = async (commentIdToDelete) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/v1/${encodeURIComponent(postId)}/comment/${encodeURIComponent(commentIdToDelete)}/delete`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete comment");
      await refreshComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  useEffect(() => {
    refreshComments();
  }, [postId, refreshComments]);

  return (
    <div className="commentSection">
      <div className="addAComment">Add a Comment</div>
      <textarea
        className="addComment"
        placeholder="Write something..."
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
      />
      <button className="viewPostButton" onClick={handlePostComment}>
        Post
      </button>

      <div className="viewPostCommentsDiv">
        <div className="viewPostComment">Comments</div>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentEntry
              key={comment._id}
              comment={comment}
              postId={postId}
              refreshComments={refreshComments}
              onDelete={handleDeleteComment}
            />
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export default CommentBody;
