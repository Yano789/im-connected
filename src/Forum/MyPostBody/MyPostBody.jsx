import "./MyPostBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
import Delete from "../Delete/Delete";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../config/api.js";

function MyPostBody() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const { t } = useTranslation();

  const removePost = (id) => {
    setMyPosts((prev) => prev.filter((post) => post.postId !== id));
  };

  const [query, setQuery] = useState({
    filter: "default",
    mode: "default",
    sort: "latest",
    source: "personalized",
  });

    const TAGS = {
    1: "All",
    2: "Physical Disability & Chronic Illness",
    3: "Personal Mental Health",
    4: "Subsidies and Govt Support",
    5: "Pediatric Care",
    6: "End of Life Care",
    7: "Financial & Legal Help",
    8: "Mental Disability",
    9: "Hospitals and Clinics",
  };

  const updateQuery = (newParams) => {
    setQuery((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(query).toString();
        const response = await fetch(`${API_ENDPOINTS.POST_BASE}/?${params}`, {
          method: "GET",
          credentials: "include",
        });
        console.log(`${API_ENDPOINTS.POST_BASE}/?${params}`);
        if (!response.ok) throw new Error("Failed to fetch your posts");
        const data = await response.json();
        setMyPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, [query]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const likedRes = await fetch(API_ENDPOINTS.LIKE_BASE, {
          method: "GET",
          credentials: "include",
        });
        if (!likedRes.ok) throw new Error("Failed to fetch liked posts");
        const likedData = await likedRes.json();
        setLikedPostIds(new Set(likedData.map((p) => p.postId)));
      } catch (err) {
        console.error("Error fetching liked posts:", err.message);
      }
    };

    fetchLikedPosts();
  }, []);

  return (
    <div className="forumMain">
      <div className="forumLeftBar">
        <ToPost />
        <Filter onFilter={updateQuery} />
      </div>

      <div className="forumBody">
        {loading ? (
          <p>{"Loading..."}</p>
        ) : error ? (
          <p>{t("Error: {error}")}</p>
        ) : myPosts.length > 0 ? (
          myPosts.map((post) => (
            <ForumCard
              key={post.postId}
              postId={post.postId}
              postUser={post.username}
              postDate={new Date(post.createdAt).toLocaleDateString()}
              postTitle={post.title}
              postTags={post.tags}
              postDescription={post.content}
              postComment={post.comments}
              postLikes={post.likes}
              postMedia={post.media}
              initiallyLiked={likedPostIds.has(post.postId)}
              ActionButton={() => (
                <Delete
                  postToDelete={post.postId}
                  onDelete={() => removePost(post.postId)}
                />
              )}
            />
          ))
        ) : (
          <p>{t("You haven't posted anything yet.")}</p>
        )}
      </div>
    </div>
  );
}

export default MyPostBody;
