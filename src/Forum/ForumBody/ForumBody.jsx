import "./ForumBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
import Bookmark from "../Bookmark/Bookmark";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function ForumBody() {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const {t} = useTranslation();

  const [query, setQuery] = useState({
    filter: "default",
    mode: "default",
    sort: "latest",
  });

  const tagKeyMap = {
  "All": "Tag1",
  "Physical Disability & Chronic Illness": "Tag2",
  "Personal Mental Health": "Tag3",
  "Subsidies and Govt Support": "Tag4",
  "Pediatric Care": "Tag5",
  "End of Life Care": "Tag6",
  "Financial & Legal Help": "Tag7",
  "Mental Disability": "Tag8",
  "Hospitals and Clinic": "Tag9"
};


  const updateQuery = (newParams) => {
    setQuery((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  const handleTagFilterChange = (filterString) => {
    updateQuery({ filter: filterString || "default" });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(query).toString();
        const res = await fetch(`http://localhost:5001/api/v1/post/?${params}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [query]);

  useEffect(() => {
    const fetchSavedAndLiked = async () => {
      try {

        const savedRes = await fetch("http://localhost:5001/api/v1/saved", {
          method: "GET",
          credentials: "include",
        });
        if (!savedRes.ok) throw new Error("Failed to fetch saved posts");
        const savedData = await savedRes.json();
        setSavedPostIds(new Set(savedData.map((p) => p.postId)));

        const likedRes = await fetch("http://localhost:5001/api/v1/like", {
          method: "GET",
          credentials: "include",
        });
        if (!likedRes.ok) throw new Error("Failed to fetch liked posts");
        const likedData = await likedRes.json();
        setLikedPostIds(new Set(likedData.map((p) => p.postId)));
      } catch (err) {
        console.error("Error fetching saved/liked posts:", err.message);
      }
    };

    fetchSavedAndLiked();
  }, []);

  return (
    <div className="forumMain">
      <div className="forumLeftBar">
        <ToPost />
        <Filter onFilter={updateQuery} />
      </div>

      <div className="forumBody">
        {loading ? (
          <p>{t("Loading")}</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <ForumCard
              key={post.postId}
              postId={post.postId}
              postUser={post.username}
              postDate={new Date(post.createdAt).toLocaleDateString()}
              postTitle={post.title}
              postTags={post.tags.map((tag) => t(tagKeyMap[tag] || tag))}
              postDescription={post.content}
              postComment={post.comments}
              postLikes={post.likes}
              postMedia={post.media}
              initiallyLiked={likedPostIds.has(post.postId)}
              ActionButton={() => (
                <Bookmark
                  postId={post.postId}
                  initialBookmarked={savedPostIds.has(post.postId)}
                />
              )}
            />
          ))
        ) : (
          <p>{t("No posts available")}</p>
        )}
      </div>

      <div className="forumRightBar">
        <TopicSelector onTagFilterChange={handleTagFilterChange} />
      </div>
    </div>
  );
}

export default ForumBody;
