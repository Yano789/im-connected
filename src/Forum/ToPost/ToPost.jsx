import "./ToPost.css";
function ToPost() {
  return (
    <div className="toPost">
      <div className="toPostMain">
        <div className="toPostTitle">
          <div className="postNow">Post Now</div>
          <div className="postDrafts">Drafts</div>
        </div>
        <div className="savedPostDiv">
          <div className="postNow">Saved Posts</div>
          <img className="postArrow" alt="" src="src\assets\Arrow.png" />
        </div>
      </div>
    </div>
  );
}
export default ToPost;
