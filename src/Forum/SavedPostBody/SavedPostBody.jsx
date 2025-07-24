import ToPost from "../ToPost/ToPost";
import ForumCard from "../ForumCard/ForumCard";
import "./SavedPostBody.css";
import { useState, useEffect } from "react";
import Bookmark from "../Bookmark/Bookmark"; // adjust path if needed

function SavedPostBody() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPostIds, setLikedPostIds] = useState(new Set()); // Added liked posts state

  useEffect(() => {
    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/v1/saved`, {
          method: "GET",
          credentials: "include", // send cookies for auth
        });

        if (!response.ok) throw new Error("Failed to fetch saved posts");

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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

    fetchSavedPosts();
    fetchLikedPosts();
  }, []);

  return (
    <div className="forumMain">
      <div className="forumLeftBar">
        <ToPost />
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
              postComment={post.comments}
              postLikes={post.likes}
              postMedia={post.media}
              initiallyLiked={likedPostIds.has(post.postId)} // <-- Pass liked state here
              ActionButton={() => (
                <Bookmark
                  postId={post.postId}
                  initialBookmarked={true}
                  onUnbookmark={() => {
                    setPosts((prev) =>
                      prev.filter((p) => p.postId !== post.postId)
                    );
                  }}
                />
              )}
            />
          ))
        ) : (
          <p>No saved posts found.</p>
        )}
      </div>
    </div>
  );
}

export default SavedPostBody;
