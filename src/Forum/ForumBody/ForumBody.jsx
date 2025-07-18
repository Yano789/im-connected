import "./ForumBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
import { useState, useEffect } from "react";

function ForumBody() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // array of tagIds
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


  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(query).toString();
        const response = await fetch(`http://localhost:5000/api/v1/post/?${params}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [query]);

  // Filter posts when selectedTags change
  useEffect(() => {
    if (selectedTags.length === 0 || selectedTags.includes(1)) {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter((post) =>
          post.tags?.some((tagId) => selectedTags.includes(tagId))
        )
      );
    }
  }, [selectedTags, posts]);

  const handleTagFilterChange = (tags) => {
    setSelectedTags(tags);
  };

  return (
    <div className="forumMain">
      <div className="forumLeftBar">
        <ToPost />
        <Filter onFilter={updateQuery}/>
      </div>

      <div className="forumBody">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <ForumCard
              key={post.postId}
              postUser={post.username}
              postDate={new Date(post.createdAt).toLocaleDateString()}
              postTitle={post.title}
              postTags={post.tags}
              postDescription={post.content}
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