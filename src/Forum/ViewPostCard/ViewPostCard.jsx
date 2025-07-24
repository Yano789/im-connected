import "./ViewPostCard.css";
import CommentBody from "../CommentBody/CommentBody";
import BookmarkIcon from "../../assets/Bookmark.png";
import CommentsIcon from "../../assets/Comments.png";
import LikesIcon from "../../assets/Likes.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

function ViewPostCard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("postId");
  const [postData, setPostData] = useState(null);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!postId) return;

    fetch(
      `http://localhost:5001/api/v1/post/getPost/${encodeURIComponent(postId)}`,
      {
        method: 'GET',
        credentials: 'include', // Include cookies (JWT token) in the request
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post.");
        return res.json();
      })
      .then((data) => setPostData(data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [postId]);

  const fetchComments = useCallback(() => {
    if (!postId) return;
    fetch(`http://localhost:5001/api/v1/${encodeURIComponent(postId)}/comment/`, {
      method: 'GET',
      credentials: 'include', // Include cookies (JWT token) in the request
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch comments.");
        return res.json();
      })
      .then((data) => setComments(data))
      .catch((err) => console.error("Comment fetch error:", err));
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (error) return <p>{error}</p>;
  if (!postData) return <p>Loading post...</p>;

  const {
    title,
    content,
    username,
    createdAt,
    tags = [],
    likes,
    media,
  } = postData;

  return (
    <div className="viewPostDiv">
      <div className="viewPostBody">
        <div className="viewPostData">
          <div className="viewPostTitleDiv">
            <div className="viewPostTitleParent">
              <div className="X" onClick={() => navigate("/forum")}>
                X
              </div>
              <div className="viewPostDetails">{title}</div>
              <div className="viewPostPostedDiv">
                <div className="viewDatePosted">Posted:</div>
                <div className="viewDatePosted">
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
        {media && media.length > 0 && (
          <div className="viewPostImagesDiv">
            <div className="viewPostImages">
              {media.map((m, index) => (
                <img key={index} className="viewPostImage" src={m.url} alt="post" />
              ))}
            </div>
          </div>
        )}

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
      <CommentBody
        comments={comments}
        postId={postId}
        refreshComments={fetchComments}
      />
    </div>
  );
}

export default ViewPostCard;
