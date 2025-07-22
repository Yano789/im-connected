import "./ForumCard.css";
import CommentsIcon from "../../assets/Comments.png";
import LikesIcon from "../../assets/Likes.png";
import UnlikesIcon from "../../assets/Unlikes.png";
import Boo from "../../assets/Boo.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForumCard(props) {
  const {
    postId,
    postUser,
    postDate,
    postTitle,
    postTags,
    postDescription,
    ActionButton,
    postComment,
    postLikes,
  } = props;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(postLikes);

  const likeIcon = liked ? LikesIcon : UnlikesIcon;
  const navigate = useNavigate();
  const encodedPostId = encodeURIComponent(postId);

  const handleLikeClick = async (e) => {
    e.stopPropagation();

    if (liked) return; 

    try {
      const res = await fetch(
        `http://localhost:5001/api/v1/post/${encodedPostId}/like`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to like the post");

      const data = await res.json();
      setLiked(true);
      setLikeCount(data.likes);
    } catch (err) {
      console.error("Error liking post:", err.message);
    }
  };

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
            <ActionButton />
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
          onClick={handleLikeClick}
          style={{ cursor: liked ? "not-allowed" : "pointer" }}
        >
          <img className="likesIcon" alt="likes" src={likeIcon} />
          <div className="name">{likeCount}</div>
        </div>
      </div>
    </div>
  );
}

export default ForumCard;
