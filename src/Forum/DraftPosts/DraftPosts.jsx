import { useEffect, useState } from "react";
import "./DraftPosts.css";
import DraftEntry from "../DraftEntry/DraftEntry";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../config/api.js";

function DraftPosts({ refreshTrigger, onDraftSelected }) {
  const [drafts, setDrafts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();
  const fetchDrafts = async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.POST_MY_DRAFTS,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched drafts:", data);
      setDrafts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch drafts on mount and when refreshTrigger changes
  useEffect(() => {
    fetchDrafts();
  }, [refreshTrigger]);

  // Define your delete handler here
  const handleDeleteDraft = async (postId) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.POST_DRAFT_DELETE(postId),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      // Refetch after successful delete
      fetchDrafts();
    } catch (error) {
      console.error("Failed to delete draft:", error.message);
    }
  };
  const handleOpenDraft = async (postId) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.POST_DRAFT_BY_ID(postId),
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Fetch failed");

      const data = await response.json();
      onDraftSelected(data); // <- this updates NewPostBody
      console.log("Loaded draft data: ", data);
    } catch (err) {
      console.error("Fetch draft failed", err);
    }
  };
  
  

  return (
    <div className="draftsDiv">
      <div className="draftsMain">
        <div className="draftsTitle">
          <div className="myDrafts">{t("Drafts")}</div>
          {loading && <div>{t("Loading drafts...")}</div>}
          {error && <div className="error">{t("Error: {error}")}</div>}
          {!loading && drafts.length === 0 && <div>{t("No drafts available.")}</div>}
          {drafts.map((draft) => (
            <DraftEntry
              key={draft._id}
              draftPostId={draft.postId}
              draftTitle={draft.title}
              draftDate={new Date(draft.createdAt).toLocaleDateString()}
              draftContents={draft.content}
              onDelete={handleDeleteDraft}
              onClick={(e) => {
                e.stopPropagation();
                console.log("Clicked draft:", draft.postId); // <-- Check if this even shows
                handleOpenDraft(draft.postId);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DraftPosts;
