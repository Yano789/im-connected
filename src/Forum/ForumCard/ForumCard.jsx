import "./ForumCard.css";

function ForumCard(props) {
  const postUser = props.postUser;
  const postDate = props.postDate;
  const postTitle = props.postTitle;
  const postTags = props.postTags; //max 2 tag
  const postImages = props.postImages;
  const postDescription = props.postDescription;

  return (
    <div className="post">
      <div className="data">
        <div className="forumTitle">
          <div className="titleOfPostParent">
            <div className="postTitle">{postTitle}</div>
            <div className="postedParent">
              <div className="posted">Posted:</div>
              <div className="postDate">{postDate}</div>
            </div>
          </div>
          <div className="nameParent">
            <div className="postUser">{postUser}</div>
            <img className="bookmarkIcon" alt="" src="src\assets\Bookmark.png" />
          </div>
          <div className="tags">
            {/* might need use state to pass data instead of tag */}
            <div className="tagItem">
              <div className="name">{postTags[0]}</div>
            </div>
            <div className="tagItem">
              <div className="name">{postTags[1]}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="description">
        <p className="postDescription">{postDescription}</p>
      </div>
      <div className="images">
        {/* might need use state to pass data instead of tag */}
        <div className="rectangleParent">
            <img className="postImage" src={postImages}></img>
        </div>
      </div>
      <div className="stats">
        <div className="commentsNumber">
          <img className="commentsIcon" alt="commentsIcon" src="src\assets\Comments.png" />
          <div className="name">78</div>
        </div>
        <div className="likesNumber">
          <img className="likesIcon" alt="likesIcon" src="src\assets\Likes.png" />
          <div className="name">7,354</div>
        </div>
      </div>
    </div>
  );
}

export default ForumCard;
