import "./ForumCard.css";
import CommentsIcon from "../../assets/Comments.png";
import LikesIcon from "../../assets/Likes.png";
import UnlikesIcon from "../../assets/Unlikes.png";
import Boo from "../../assets/Boo.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForumCard(props) {
  const { postId, postUser, postDate, postTitle, postTags, postDescription, ActionButton, postComment, postLikes } =
    props;

  const [liked, setLiked] = useState(false);

  const likeIcon = liked ? LikesIcon : UnlikesIcon ;

  const navigate = useNavigate();
  const encodedPostId = encodeURIComponent(postId);

  return (
    <div
      className="post"
      onClick={() => navigate(`/forum/viewpost?postId=${encodedPostId}`)}
    >
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
            <ActionButton/>
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
          <img className="postImage" src={Boo} alt="post" />
        </div>
      </div>

      <div className="stats">
        <div className="commentsNumber">
          <img className="commentsIcon" alt="comments" src={CommentsIcon} />
          <div className="name">{postComment}</div>
        </div>
        <div
          className="likesNumber"
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          style={{ cursor: "pointer" }}
        >
          <img className="likesIcon" alt="likes" src={likeIcon} />
          <div className="name">{postLikes}</div>
        </div>
      </div>
    </div>
  );
}

export default ForumCard;
