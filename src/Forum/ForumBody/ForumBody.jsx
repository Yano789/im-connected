import "./ForumBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
import { useState,useEffect } from "react";
function ForumBody(){
    //const forumData = props.forumData;
    const [posts,setPosts] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/v1/post/", {
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
    }, []);        
    return (
        <div className="forumMain">
            <div className="forumLeftBar">
                 <ToPost/>
                <Filter/>
            </div>

<div className="forumBody">
  {loading ? (
    <p>Loading...</p>
  ) : error ? (
    <p>Error: {error}</p>
  ) : posts.length > 0 ? (
    posts.map((post) => (
      <ForumCard
        key={post.postId} // unique key for React list rendering
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
                <TopicSelector/>
            </div>
        </div>  
    );

}
export default ForumBody; 