import "./ForumCard.css";
import { useState } from "react";

function ForumCard(props) {
  const { postUser, postDate, postTitle, postTags, postDescription } = props;

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const likeIcon = liked ? "src/assets/Likes.png" : "src/assets/Unlikes.png";
  const bookmarkIcon = bookmarked ? "src/assets/Bookmark.png" : "src/assets/Unbookmark.png";

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
            {/* Toggle bookmark on click */}
            <img
              className="bookmarkIcon"
              alt="bookmark"
              src={bookmarkIcon}
              onClick={() => setBookmarked(!bookmarked)}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="tags">
            <div className="tagItem"><div className="name">{postTags[0]}</div></div>
            <div className="tagItem"><div className="name">{postTags[1]}</div></div>
          </div>
        </div>
      </div>

      <div className="description">
        <p className="postDescription">{postDescription}</p>
      </div>

      <div className="images">
        <div className="rectangleParent">
          <img className="postImage" src="src\assets\Boo.jpg" alt="post" />
        </div>
      </div>

      <div className="stats">
        <div className="commentsNumber">
          <img className="commentsIcon" alt="comments" src="src\assets\Comments.png" />
          <div className="name">0</div>
        </div>
        <div className="likesNumber" onClick={() => setLiked(!liked)} style={{ cursor: "pointer" }}>
          <img className="likesIcon" alt="likes" src={likeIcon} />
          <div className="name">0</div>
        </div>
      </div>
    </div>
  );
}

export default ForumCard;
