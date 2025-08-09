import AIDashboardEntry from "../AIDashboardEntry/AIDashboardEntry";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../config/api.js";

function ForumDashboard() {
  const [topPosts, setTopPosts] = useState({
    latest: null,
    liked: null,
    commented: null,
  });

  const navigate = useNavigate();
  const {t} = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopPost = async (sortType) => {
    const params = new URLSearchParams({
      sort: sortType,
      mode: "default",
      filter: "default",
      source: "all"
    });

    try {
      const res = await fetch(`${API_ENDPOINTS.POST_BASE}/?${params}`, {
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
      <p className="card-header">{t("Forum")}</p>
      <p className="card-subheader">{t("ForumSubHeader")}</p>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <AIDashboardEntry
            itemName={t("Latest Post")}
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
            itemName={t("Highest Liked Post")}
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
            itemName={t("Highest Commented Post")}
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
