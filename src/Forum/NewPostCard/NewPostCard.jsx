import { useState} from "react";
import "./NewPostCard.css";
import MediaUploader from "../MediaUploader/MediaUploader.jsx";

function NewPostCard() {
  const [selectedTags, setSelectedTags] = useState([]);
  const tags = [
    "Mental Disability",
    "Mental Health",
    "End of Life Care",
    "Govt Support",
    "Financial Help",
    "Disability & Chronic Illness",
    "Hospitals",
    "Pediatric",
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 2) {
      setSelectedTags([...selectedTags, tag]);
    }
  };


  return (
    <div className="postMain">
      <div className="postData">
        <div className="createPostDiv">
          <div className="createPost">Create Post</div>
          <div className="x">X</div>
        </div>

        <div className="postTitleDiv">
          <div className="postTitle">Title</div>
          <textarea className="createPostWrapper">Suggest a name for this Text</textarea>
        </div>

        <div className="postData">
          <div className="selectTagsAssociated">
            Select Tags (Max 2) associated with this post:
          </div>
          <div className="tags">
            {tags.map((tag) => (
              <div
                key={tag}
                className={`tag ${selectedTags.includes(tag) ? "tagSelected" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                <div className="tagText">{tag}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="addTextDiv">
          <div className="addText">Add Text</div>
          <textarea className="addTextWrapper">Add your post's contents here</textarea>
        </div>
		<MediaUploader/>
        <div className="postButtonsDiv">
          <div className="buttonStyle1">
            <div className="tagText">Post</div>
          </div>
          <div className="buttonStyle2">
            <div className="tagText">Save as Draft</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPostCard;
