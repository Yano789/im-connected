import "./ViewPostCard.css";
import Bookmark from "../Bookmark/Bookmark";
import CommentBody from "../CommentBody/CommentBody";
import CommentsIcon from "../../assets/Comments.png";
import LikesIcon from "../../assets/Likes.png";
import UnlikesIcon from "../../assets/Unlikes.png";

import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

function ViewPostCard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { t } = useTranslation();

  const postId = searchParams.get("postId");

  const initialBookmarked = location.state?.bookmarked || false;
  const initialLiked = location.state?.liked || false;

  const [postData, setPostData] = useState(null);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(0);

  const tagKeyMap = {
    All: "Tag1",
    "Physical Disability & Chronic Illness": "Tag2",
    "Personal Mental Health": "Tag3",
    "Subsidies and Govt Support": "Tag4",
    "Pediatric Care": "Tag5",
    "End of Life Care": "Tag6",
    "Financial & Legal Help": "Tag7",
    "Mental Disability": "Tag8",
    "Hospitals and Clinic": "Tag9",
  };

  useEffect(() => {
    if (!postId) return;

    fetch(
      `http://localhost:5001/api/v1/post/getPost/${encodeURIComponent(postId)}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post.");
        return res.json();
      })
      .then((data) => {
        setPostData(data);
        setLikeCount(data.likes || 0);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [postId]);

  const fetchComments = useCallback(() => {
    if (!postId) return;
    fetch(
      `http://localhost:5001/api/v1/${encodeURIComponent(postId)}/comment/`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
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

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    try {
      const url = `http://localhost:5001/api/v1/like/${encodeURIComponent(
        postId
      )}/${liked ? "unlike" : "like"}`;
      const method = liked ? "DELETE" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
      });

      if (!res.ok)
        throw new Error(`Failed to ${liked ? "unlike" : "like"} post`);

      const data = await res.json();
      setLiked(!liked);
      setLikeCount(data.likes);
    } catch (err) {
      console.error("Error toggling like:", err.message);
    }
  };

  if (error) return <p>{error}</p>;
  if (!postData) return <p>Loading post...</p>;

  const { title, content, username, createdAt, tags = [], media } = postData;

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
                <div className="viewDatePosted">{t("Posted")}</div>
                <div className="viewDatePosted">
                  {new Date(createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="viewPostName">
              <div className="viewPostUsername">{username}</div>
              <Bookmark postId={postId} initialBookmarked={initialBookmarked} />
            </div>
            <div className="viewPostTags">
              {tags.slice(0, 2).map((tag, idx) => (
                <div className="tag" key={idx}>
                  <div className="name">{t(tagKeyMap[tag] || tag)}</div>
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
                <img
                  key={index}
                  className="viewPostImage"
                  src={m.url}
                  alt="post"
                />
              ))}
            </div>
          </div>
        )}

        <div className="viewPostStatsDiv">
          <div className="commentsNumber">
            <img className="commentsIcon" alt="Comments" src={CommentsIcon} />
            <div className="name">{comments.length}</div>
          </div>
          <div
            className="likesNumber"
            onClick={handleLikeToggle}
            style={{ cursor: "pointer" }}
          >
            <img
              className="likesIcon"
              alt="Likes"
              src={liked ? LikesIcon : UnlikesIcon}
            />
            <div className="name">{likeCount}</div>
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
