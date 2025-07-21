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

  const removePost = (id) => {
    setMyPosts((prev) => prev.filter((post) => post.postId !== id));
  };

  // ✅ Add `source: "personalised"` to query
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

  // ✅ Optional: hook TopicSelector into updateQuery if you want tag filtering
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
