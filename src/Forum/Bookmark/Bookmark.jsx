import "./Bookmark.css";
import BookmarkIcon from "../../assets/Bookmark.png";
import UnbookmarkIcon from "../../assets/Unbookmark.png";
import { useState } from "react";

function Bookmark({ postId, token, initialBookmarked, onUnbookmark }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const bookmarkIcon = bookmarked ? BookmarkIcon : UnbookmarkIcon;

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();

    const url = `http://localhost:5001/api/v1/saved/${encodeURIComponent(postId)}/${bookmarked ? "delete" : "save"}`;
    const method = bookmarked ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include", // in case token is cookie
      });
      if (!res.ok) throw new Error(await res.text());

      // flip state
      const newState = !bookmarked;
      setBookmarked(newState);

      // notify parent if unbookmarked
      if (!newState && onUnbookmark) {
        onUnbookmark();
      }
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
