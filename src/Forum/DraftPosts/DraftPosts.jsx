import { useEffect, useState } from "react";
import "./DraftPosts.css";
import DraftEntry from "../DraftEntry/DraftEntry";

function DraftPosts({refreshTrigger}) {
  const [drafts, setDrafts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/post/myDrafts", {
          method: "GET",
          credentials: "include",
        });

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

    fetchDrafts();
  }, [refreshTrigger]);

  return (
    <div className="draftsDiv">
      <div className="draftsMain">
        <div className="draftsTitle">
          <div className="myDrafts">Drafts</div>
          {loading && <div>Loading drafts...</div>}
          {error && <div className="error">Error: {error}</div>}
          {!loading && drafts.length === 0 && <div>No drafts available.</div>}
          {drafts.map((draft) => (
            <DraftEntry
              key={draft._id}
              draftTitle={draft.title}
              draftDate={new Date(draft.createdAt).toLocaleDateString()}
              draftContents={draft.content}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DraftPosts;
