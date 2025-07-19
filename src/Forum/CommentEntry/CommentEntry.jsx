import "./CommentEntry.css";
function CommentEntry(props) {
    const commentUsername = props.commentUsername;
    const commentDate = props.commentDate;
    const commentContent = props.commentContent;
  return (
    <div className="commentDiv">
      <div className="commentBody">
        <div className="commentUsername">{commentUsername}</div>
        <div className="commentDate">{commentDate}</div>
      </div>
      <div className="commentContent"> {commentContent}</div>
    </div>
  );
}
export default CommentEntry;
