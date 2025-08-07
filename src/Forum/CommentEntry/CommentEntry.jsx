// CommentEntry.jsx
import { useState } from "react";
import "./CommentEntry.css";
import { useTranslation } from "react-i18next";

function CommentEntry({ comment, postId, refreshComments, onDelete }) {
  const { commentId, username, createdAt, content, children = [] } = comment;

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const {t} = useTranslation();


  const handleEdit = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/v1/${encodeURIComponent(postId)}/comment/${encodeURIComponent(commentId)}/edit`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editedContent }),
        }
      );

      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setIsEditing(false);
      setEditedContent(updated.content);
    } catch (err) {
      console.error("Error editing comment:", err.message);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/v1/${encodeURIComponent(postId)}/comment/create`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: replyContent,
            parentCommentId: commentId,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to post reply");
      await refreshComments();
      setReplyContent("");
      setIsReplying(false);
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const handleDelete = () => {
    onDelete(commentId); // just delegate
  };

  return (
    <div className="commentDiv">
      <div className="commentBody">
        <div className="commentUsername">{username}</div>
        <div className="commentDate">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      {isEditing ? (
        <>
          <textarea
            className="commentContent"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="commentFunction">
            <div onClick={handleEdit} className="cursor-pointer">{t("Save")}</div>
            <div
              onClick={() => {
                setIsEditing(false);
                setEditedContent(content);
              }}
              className="cursor-pointer"
            >
              {t("Cancel")}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="commentContent">{editedContent}</div>
          <div className="commentFunction">
            <div className="cursor-pointer" onClick={handleDelete}>{t("Delete")}</div>
            <div className="cursor-pointer" onClick={() => setIsReplying(!isReplying)}>{t("Reply")}</div>
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">{t("Edit")}</div>
          </div>
        </>
      )}

      {isReplying && (
        <div className="replySection">
          <textarea
            className="replyInput"
            placeholder={t("Write your reply...")}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button onClick={handleReply} className="replyButton">{t("Post Reply")}</button>
        </div>
      )}

      {children.length > 0 && (
        <div className="nestedComments">
          {children.map((child) => (
            <CommentEntry
              key={child._id}
              comment={child}
              postId={postId}
              refreshComments={refreshComments}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentEntry;
