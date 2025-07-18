import "./ViewPost.css";
import CommentEntry from "../CommentEntry/CommentEntry";
function ViewPost(props) {
  const viewPostTitle = props.viewPostTitle;
  const viewPostDate = props.viewPostDate;
  const viewPostUsername= props.viewPostUsername;
  const viewPostContents = props.viewPostContents;
  //const viewPostTags = props.viewPostTags;
  const viewPostLikes = props.viewPostLikes;
  const viewPostComments = props.viewPostComments;
  //const viewPostCommentsArray = props.viewPostCommentsArray;

  return (
    <div className="viewPostDiv">
      <div className="viewPostBody">
        <div className="viewPostData">
          <div className="viewPostTitleDiv">
            <div className="viewPostTitleParent">
              <div className="X">X</div>
              <div className="viewPostDetails"> {viewPostTitle}</div>
              <div className="viewPostPostedDiv">
                <div className="viewPostDetails">Posted:</div>
                <div className="viewPostDetails">{viewPostDate}</div>
              </div>
            </div>
            <div className="viewPostName">
              <div className="viewPostUsername">{viewPostUsername}</div>
              <img className="bookmarkIcon" alt="" src="Bookmark.png" />
            </div>
            <div className="viewPostTags">
              <div className="tag">
                <div className="name">0</div>
              </div>
              <div className="tag">
                <div className="name">dddd</div>
              </div>
            </div>
          </div>
        </div>
        <div className="viewPostDescriptionDiv">
          <div className="viewPostDescription">{viewPostContents}</div>
        </div>
        <div className="viewPostStatsDiv">
          <div className="commentsNumber">
            <img className="commentsIcon" alt="" src="Comments.png" />
            <div className="name">{viewPostComments}</div>
          </div>
          <div className="likesNumber">
            <img className="likesIcon" alt="" src="Bookmark.png" />
            <div className="name">{viewPostLikes}</div>
          </div>
        </div>
      </div>
      <div className="viewPostTitleDiv">
        <div className="addAComment">Add a Comment</div>
        <textarea className="addComment">
          <button className="buttonStyle1">Post </button>
        </textarea>
      </div>
      <div className="viewPostCommentsDiv">
        <div className="viewPostComment">Comments</div>
        <CommentEntry/>
        <CommentEntry/>
      </div>
    </div>
  );
}

export default ViewPost;
