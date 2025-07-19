import { useState, useCallback, useEffect } from "react";
import "./NewPostCard.css";
import MediaUploader from "../MediaUploader/MediaUploader.jsx";

function NewPostCard({ onDraftAdded, renderDraft }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [draftPostId, setDraftPostId] = useState(null);

  const tags = [
    "Physical Disability & Chronic Illness",
    "Personal Mental Health",
    "End of Life Care",
    "Financial & Legal Help",
    "Mental Disability",
    "Hospitals and Clinics",
    "Pediatric Care",
    "Subsidies and Govt Support",
  ];

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 2) return prev;
      return [...prev, tag];
    });
  }, []);

  const handleSubmit = async (isDraft = true) => {
    try {
      const payload = {
        title,
        content,
        tags: selectedTags,
        draft: isDraft,
      };

      let response;
      if (isDraft && draftPostId) {
        const encodedPostId = encodeURIComponent(draftPostId);
        response = await fetch(
          `http://localhost:5000/api/v1/post/myDrafts/${encodedPostId}/edit`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
      } else {
        // CREATE new post or draft
        response = await fetch("http://localhost:5000/api/v1/post/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("Success:", data);
      if (!draftPostId && data._id) {
        setDraftPostId(data._id);
      }

      if (isDraft && onDraftAdded) {
        onDraftAdded(data);
      }
    } catch (error) {
      console.error("Error submitting post:", error.message);
    }
  };

  useEffect(() => {
    if (renderDraft && renderDraft._id) {
      setTitle(renderDraft.title || "");
      setContent(renderDraft.content || "");
      setSelectedTags(renderDraft.tags || []);
      setDraftPostId(renderDraft.postId || null);
    } else {
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setDraftPostId(null);
    }
  }, [renderDraft]);

  return (
    <div className="postMain">
      <form
        className="postData"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(true);
        }}
      >
        <div className="createPostDiv">
          <div className="createPost">Create Post</div>
          <div className="x">X</div>
        </div>

        <div className="postTitleDiv">
          <div className="postTitle">Title</div>
          <textarea
            className="createPostWrapper"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Suggest a name for this Text"
          />
        </div>

        <div className="postData">
          <div className="selectTagsAssociated">
            Select Tags (Max 2) associated with this post:
          </div>
          <div className="tags">
            {tags.map((tag) => (
              <div
                key={tag}
                className={`newPostTag ${
                  selectedTags.includes(tag) ? "newPostTagSelected" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTag(tag);
                }}
              >
                <div className="tagText">{tag}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="addTextDiv">
          <div className="addText">Add Text</div>
          <textarea
            className="addTextWrapper"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your post's contents here"
          />
        </div>

        <MediaUploader />

        <div className="postButtonsDiv">
          <button
            type="submit"
            className="buttonStyle1"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(false);
            }}
          >
            <div className="tagText">Post</div>
          </button>

          <button
            type="button"
            className="buttonStyle2"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(true);
            }}
          >
            <div className="tagText">Save as Draft</div>
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewPostCard;
