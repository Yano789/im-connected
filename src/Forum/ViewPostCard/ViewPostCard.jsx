import "./ViewPostCard.css";
import CommentEntry from "../CommentEntry/CommentEntry";
import BookmarkIcon from "../../assets/Bookmark.png";
import CommentsIcon from "../../assets/Comments.png";
import LikesIcon from "../../assets/Likes.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function ViewPostCard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("postId");

  const [postData, setPostData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;

    fetch(`http://localhost:5001/api/v1/post/getPost/${encodeURIComponent(postId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post.");
        return res.json();
      })
      .then((data) => {
        setPostData(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [postId]);

  if (error) return <p>{error}</p>;
  if (!postData) return <p>Loading post...</p>;

  const {
    title,
    content,
    username,
    createdAt,
    tags = [],
    likes,
    comments = [],
  } = postData;

  return (
    <div className="viewPostDiv">
      <div className="viewPostBody">
        <div className="viewPostData">
          <div className="viewPostTitleDiv">
            <div className="viewPostTitleParent">
              <div className="X" onClick={() => navigate("/forum")}>X</div>
              <div className="viewPostDetails">{title}</div>
              <div className="viewPostPostedDiv">
                <div className="viewPostDetails">Posted:</div>
                <div className="viewPostDetails">
                  {new Date(createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="viewPostName">
              <div className="viewPostUsername">{username}</div>
              <img className="bookmarkIcon" alt="Bookmark" src={BookmarkIcon} />
            </div>
            <div className="viewPostTags">
              {tags.slice(0, 2).map((tag, idx) => (
                <div className="tag" key={idx}>
                  <div className="name">{tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="viewPostDescriptionDiv">
          <div className="viewPostDescription">{content}</div>
        </div>
        <div className="viewPostStatsDiv">
          <div className="commentsNumber">
            <img className="commentsIcon" alt="Comments" src={CommentsIcon} />
            <div className="name">{comments.length}</div>
          </div>
          <div className="likesNumber">
            <img className="likesIcon" alt="Likes" src={LikesIcon} />
            <div className="name">{likes}</div>
          </div>
        </div>
      </div>

      <div className="viewPostTitleDiv">
        <div className="addAComment">Add a Comment</div>
        <textarea className="addComment" placeholder="Write something..." />
        <button className="viewPostButton">Post</button>
      </div>

      <div className="viewPostCommentsDiv">
        <div className="viewPostComment">Comments</div>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentEntry
              key={comment._id} // or comment.id
              commentUsername={comment.username}
              commentDate={new Date(comment.createdAt).toLocaleDateString()}
              commentContent={comment.content}
            />
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export default ViewPostCard;
