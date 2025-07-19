import "./ForumCard.css";
import BookmarkIcon from "../../assets/Bookmark.png";
import CommentsIcon from "../../assets/Comments.png";
import LikesIcon from "../../assets/Likes.png";
import UnbookmarkIcon from "../../assets/Unbookmark.png";
import UncommentsIcon from "../../assets/Uncomments.png";
import UnlikesIcon from "../../assets/Unlikes.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForumCard(props) {
  const { postId, postUser, postDate, postTitle, postTags, postDescription } = props;
  
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const likeIcon = liked ? {LikesIcon} : {UnlikesIcon};
  const bookmarkIcon = bookmarked ? {bookmarkIcon} : {UnbookmarkIcon};

  const navigate = useNavigate();
  const encodedPostId = encodeURIComponent(postId);

  return (
    <div className="post" onClick={() => navigate(`/forum/viewpost?postId=${encodedPostId}`)}>
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
            {postTags && postTags.length > 0 ? (
              postTags.map((tag, index) => (
                <div className="tagItem" key={index}>
                  <div className="name">{tag}</div>
                </div>
              ))
            ) : (
              <div className="tagItem">
                <div className="name">No tags</div>
              </div>
            )}
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
          <img
            className="commentsIcon"
            alt="comments"
            src={CommentsIcon}
          />
          <div className="name">0</div>
        </div>
        <div
          className="likesNumber"
          onClick={() => setLiked(!liked)}
          style={{ cursor: "pointer" }}
        >
          <img className="likesIcon" alt="likes" src={likeIcon} />
          <div className="name">0</div>
        </div>
      </div>
    </div>
  );
}

export default ForumCard;
