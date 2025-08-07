import "./Delete.css";
import TrashIcon from "../../assets/Trash.png";
import { useState } from "react";


function Delete({ postToDelete, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation(); 

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setIsDeleting(true);
            const response = await fetch(
        `http://localhost:5001/api/v1/post/${encodeURIComponent(postToDelete)}/delete`,
        {
          method: "DELETE",
          credentials: "include",
        }

    );

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Failed to delete post.");
      }

      const result = await response.json();
      console.log("Deleted:", result);

      // Optionally update parent UI
      if (onDelete) onDelete();

    } catch (err) {
      alert("Error deleting post: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <img
        className="bookmarkIcon"
        alt="delete"
        src={TrashIcon}
        onClick={handleDelete}
        style={{ cursor: "pointer", opacity: isDeleting ? 0.5 : 1 }}
      />
    </div>
  );
}

export default Delete;
