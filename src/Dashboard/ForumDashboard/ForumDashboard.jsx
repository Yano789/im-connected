import AIDashboardEntry from "../AIDashboardEntry/AIDashboardEntry";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ForumDashboard() {
  const [topPosts, setTopPosts] = useState({
    latest: null,
    liked: null,
    commented: null,
  });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopPost = async (sortType) => {
    const params = new URLSearchParams({
      sort: sortType,
      mode: "default",
      filter: "default",
    });

    try {
      const res = await fetch(`http://localhost:5001/api/v1/post/?${params}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch ${sortType} post`);

      const data = await res.json();
      return data[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const loadTopPosts = async () => {
      setLoading(true);
      try {
        const [latest, liked, commented] = await Promise.all([
          fetchTopPost("latest"),
          fetchTopPost("most likes"),
          fetchTopPost("most comments"),
        ]);

        setTopPosts({ latest, liked, commented });
      } catch (err) {
        setError("Unable to load forum highlights.");
      } finally {
        setLoading(false);
      }
    };

    loadTopPosts();
  }, []);

  return (
    <div className="cardDiv">
      <p className="card-header">Forum</p>
      <p className="card-subheader">View trending posts</p>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <AIDashboardEntry
            itemName="Latest Post"
            itemTitle={topPosts.latest?.title || "N/A"}
            onClick={() =>
              navigate(
                `/forum/viewpost?postId=${encodeURIComponent(
                  topPosts.latest?.postId
                )}`
              )
            }
          />
          <AIDashboardEntry
            itemName="Highest Liked Post"
            itemTitle={topPosts.liked?.title || "N/A"}
            onClick={() =>
              navigate(
                `/forum/viewpost?postId=${encodeURIComponent(
                  topPosts.liked?.postId
                )}`
              )
            }
          />
          <AIDashboardEntry
            itemName="Highest Commented Post"
            itemTitle={topPosts.commented?.title || "N/A"}
            onClick={() =>
              navigate(
                `/forum/viewpost?postId=${encodeURIComponent(
                  topPosts.commented?.postId
                )}`
              )
            }
          />
        </>
      )}
    </div>
  );
}

export default ForumDashboard;
