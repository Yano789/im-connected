import "./Bookmark.css";
import BookmarkIcon from "../../assets/Bookmark.png";
import UnbookmarkIcon from "../../assets/Unbookmark.png";
import { useState } from "react";
import { API_ENDPOINTS } from "../../config/api.js";

function Bookmark({ postId, initialBookmarked}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const bookmarkIcon = bookmarked ? BookmarkIcon : UnbookmarkIcon;

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();

    const url = API_ENDPOINTS.SAVED_POST_ACTION(postId, bookmarked ? "delete" : "save");
    const method = bookmarked ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());

      const newState = !bookmarked;
      setBookmarked(newState);

    } catch (err) {
      console.error("Error updating bookmark:", err.message);
    }
  };

  return (
    <div>
      <img
        className="bookmarkIcon"
        alt="bookmark"
        src={bookmarkIcon}
        onClick={handleBookmarkClick}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}

export default Bookmark;
