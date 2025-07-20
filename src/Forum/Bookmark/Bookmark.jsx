import "./Bookmark.css";
import BookmarkIcon from "../../assets/Bookmark.png";
import UnbookmarkIcon from "../../assets/Unbookmark.png";
import { useState } from "react";
function Bookmark() {
      const [bookmarked, setBookmarked] = useState(false);
       const bookmarkIcon = bookmarked ? BookmarkIcon  :  UnbookmarkIcon ;
  return (
    <div>
      <img
        className="bookmarkIcon"
        alt="bookmark"
        src={bookmarkIcon}
        onClick={(e) => {
          e.stopPropagation();
          setBookmarked(!bookmarked);
        }}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}
export default Bookmark;
