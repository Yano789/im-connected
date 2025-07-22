import NewPostCard from "../NewPostCard/NewPostCard";
import DraftPosts from "../DraftPosts/DraftPosts";
import "./NewPostBody.css";
import { useState } from "react";

function NewPostBody() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedDraft, setSelectedDraft] = useState(null);

  const handleDraftAdded = (updatedDraft) => {
    setRefreshCount((count) => count + 1);

    if (
      selectedDraft &&
      updatedDraft &&
      updatedDraft._id === selectedDraft._id
    ) {
      setSelectedDraft(updatedDraft); 
    }
  };

  return (
    <div className="newPostDiv">
      <div className="newPostBody">
        <NewPostCard
          onDraftAdded={handleDraftAdded}
          renderDraft={selectedDraft}
        />
      </div>
      <DraftPosts
        refreshTrigger={refreshCount}
        onDraftSelected={(selectedDraft) => setSelectedDraft(selectedDraft)}
      />
    </div>
  );
}
export default NewPostBody;
