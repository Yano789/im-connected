import "./MyPostBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
import Delete from "../Delete/Delete";
import { useState, useEffect } from "react";

function MyPostBody() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState(new Set());  // <-- Added liked posts state

  const removePost = (id) => {
    setMyPosts((prev) => prev.filter((post) => post.postId !== id));
  };

  const [query, setQuery] = useState({
    filter: "default",
    mode: "default",
    sort: "latest",
    source: "personalized",
  });

  const updateQuery = (newParams) => {
    setQuery((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  // Fetch my posts on query change
  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(query).toString();
        const response = await fetch(
          `http://localhost:5001/api/v1/post/?${params}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
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

  // Fetch liked posts ONCE on mount
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const likedRes = await fetch("http://localhost:5001/api/v1/like", {
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

  const handleTagFilterChange = (filterString) => {
    if (!filterString || filterString === "") {
      updateQuery({ filter: "default" });
    } else {
      updateQuery({ filter: filterString });
    }
  };

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
          <p>You haven’t posted anything yet.</p>
        )}
      </div>

      <div className="forumRightBar">
        <TopicSelector onTagFilterChange={handleTagFilterChange} />
      </div>
    </div>
  );
}

export default MyPostBody;
