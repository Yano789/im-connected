import NewPostCard from "../NewPostCard/NewPostCard";
import DraftPosts from "../DraftPosts/DraftPosts";
import "./NewPostBody.css";
import { useState } from "react";

function NewPostBody() {
    
  const [refreshCount, setRefreshCount] = useState(0);

  const handleDraftAdded = () => {
    setRefreshCount((count) => count + 1); 
  };

  return (
    <div className="newPostDiv">
      <div className="newPostBody">
        <NewPostCard onDraftAdded={handleDraftAdded} />
      </div>
      <DraftPosts refreshTrigger={refreshCount} />
    </div>
  );
}
export default NewPostBody;
