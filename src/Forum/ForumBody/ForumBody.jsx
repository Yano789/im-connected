import "./ForumBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
import Bookmark from "../Bookmark/Bookmark";
import { useState, useEffect } from "react";

function ForumBody() {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState({
    filter: "default",
    mode: "default",
    sort: "latest",
  });

  const updateQuery = (newParams) => {
    setQuery((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  const handleTagFilterChange = (filterString) => {
    updateQuery({ filter: filterString || "default" });
  };

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(query).toString();
        const res = await fetch(`http://localhost:5000/api/v1/post/?${params}`, {
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

  // Fetch saved post IDs once
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/saved", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch saved posts");
        const data = await res.json();
        setSavedPostIds(new Set(data.map((p) => p.postId)));
      } catch (err) {
        console.error("Error fetching saved posts:", err.message);
      }
    };

    fetchSavedPosts();
  }, []);

  return (
    <div className="forumMain">
      <div className="forumLeftBar">
        <ToPost />
        <Filter onFilter={updateQuery} />
      </div>

      <div className="forumBody">
        {loading ? (
          <p>Loading...</p>
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
              postTags={post.tags}
              postDescription={post.content}
              ActionButton={() => (
                <Bookmark
                  postId={post.postId}
                  initialBookmarked={savedPostIds.has(post.postId)}
                />
              )}
            />
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      <div className="forumRightBar">
        <TopicSelector onTagFilterChange={handleTagFilterChange} />
      </div>
    </div>
  );
}

export default ForumBody;
