import NewPostCard from "../NewPostCard/NewPostCard";
import DraftPosts from "../DraftPosts/DraftPosts";
import "./NewPostBody.css";
import { useState } from "react";

function NewPostBody() {
    
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedDraft, setSelectedDraft] = useState(null);

  const handleDraftAdded = () => {
    setRefreshCount((count) => count + 1); 
  };

  return (
    <div className="newPostDiv">
      <div className="newPostBody">
        <NewPostCard onDraftAdded={handleDraftAdded} renderDraft={selectedDraft} />
      </div>
      <DraftPosts refreshTrigger={refreshCount} onDraftSelected={(selectedDraft) => setSelectedDraft(selectedDraft)} />
    </div>
  );
}
export default NewPostBody;
