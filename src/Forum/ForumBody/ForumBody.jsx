import "./ForumBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
import Bookmark from "../Bookmark/Bookmark";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../config/api.js";

function ForumBody() {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const [selectedTopics, setSelectedTopics] = useState([]); // stores topic IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const [query, setQuery] = useState({
    filter: "default",
    mode: "default",
    sort: "latest",
  });

  // Map backend topic IDs to names
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

  const tagKeyMap = {
    "All": "Tag1",
    "Physical Disability & Chronic Illness": "Tag2",
    "Personal Mental Health": "Tag3",
    "Subsidies and Govt Support": "Tag4",
    "Pediatric Care": "Tag5",
    "End of Life Care": "Tag6",
    "Financial & Legal Help": "Tag7",
    "Mental Disability": "Tag8",
    "Hospitals and Clinics": "Tag9"
  };

  const updateQuery = (newParams) => {
    setQuery((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  const handleTagFilterChange = (selection) => {
    // `selection` will be array of topic IDs
    setSelectedTopics(selection);

    if (selection.includes(1)) {
      // "All" selected
      updateQuery({ filter: "default", source: "all" });
    } else {
      const selectedTagNames = selection
        .map((id) => TAGS[id])
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .join(",");
      updateQuery({ filter: selectedTagNames, source: "default"});
    }
  };

  // Fetch posts whenever query changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(query).toString();
        const res = await fetch(`${API_ENDPOINTS.POST_BASE}/?${params}`, {
          method: "GET",
          credentials: "include",
        });
        console.log(`${API_ENDPOINTS.POST_BASE}/?${params}`)
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [query]);

  // Fetch user preferences once on load
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.USER_GET, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user preferences");
        const data = await res.json();

        // Assume backend sends topic IDs; if it sends names, adjust accordingly
        const topicIds = (data.preferences.topics || [])
          .map((t) => {
            if (typeof t === "number") return t; // already ID
            return Object.entries(TAGS).find(([id, name]) => name === t)?.[0] * 1;
          })
          .filter(Boolean);

        setSelectedTopics(topicIds);
        handleTagFilterChange(topicIds);
      } catch (err) {
        console.error("Error fetching preferences:", err.message);
      }
    };

    fetchUserPreferences();
  }, []);

  // Fetch saved + liked posts once
  useEffect(() => {
    const fetchSavedAndLiked = async () => {
      try {
        const savedRes = await fetch(API_ENDPOINTS.SAVED_POSTS, {
          method: "GET",
          credentials: "include",
        });
        if (!savedRes.ok) throw new Error("Failed to fetch saved posts");
        const savedData = await savedRes.json();
        setSavedPostIds(new Set(savedData.map((p) => p.postId)));

        const likedRes = await fetch(API_ENDPOINTS.LIKE_BASE, {
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
        <TopicSelector
          onTagFilterChange={handleTagFilterChange}
          clickedTopics={selectedTopics}
        />
      </div>
    </div>
  );
}

export default ForumBody;
