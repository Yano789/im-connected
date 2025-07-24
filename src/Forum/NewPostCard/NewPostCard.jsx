import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NewPostCard.css";
import MediaUploader from "../MediaUploader/MediaUploader.jsx";

function NewPostCard({ onDraftAdded, renderDraft }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [draftPostId, setDraftPostId] = useState(null);

  // Existing media objects from backend: {url, type, public_id}
  const [existingMedia, setExistingMedia] = useState([]);

  // Keep track of which existing media user removed (array of public_id)
  const [mediaToRemove, setMediaToRemove] = useState([]);

  // New files user uploads (File objects)
  const [mediaFiles, setMediaFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setDraftPostId(null);
    setExistingMedia([]);
    setMediaFiles([]);
    setMediaToRemove([]);
  };

  const navigate = useNavigate();

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 2) return prev;
      return [...prev, tag];
    });
  }, []);

  // Called by MediaUploader when user uploads new files
  const handleNewMediaChange = (files) => {
    setMediaFiles(files);
  };

  // Called by MediaUploader when user removes a new uploaded file (optional, if your uploader supports it)
  const handleRemoveNewFile = (indexToRemove) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // When user removes existing media (already uploaded, saved on backend)
  const handleRemoveExistingMedia = (public_idToRemove) => {
    setExistingMedia((prev) =>
      prev.filter((media) => media.public_id !== public_idToRemove)
    );
    setMediaToRemove((prev) => [...prev, public_idToRemove]);
  };

  const handleSubmit = async (isDraft = true) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);
      formData.append("draft", isDraft);
      selectedTags.forEach((tag) => formData.append("tags", tag));

      // Append new files
      mediaFiles.forEach((file) => formData.append("media", file));

      // Append JSON string of public_ids to remove
      mediaToRemove.forEach((id) => {
        formData.append("mediaToRemove[]", id);
      });

      let response;

      if (isDraft && draftPostId) {
        const encodedPostId = encodeURIComponent(draftPostId);
        response = await fetch(
          `http://localhost:5001/api/v1/post/myDrafts/${encodedPostId}/edit`,
          {
            method: "PUT", // confirm your backend supports this with multipart/form-data
            credentials: "include",
            body: formData,
          }
        );
      } else {
        response = await fetch("http://localhost:5001/api/v1/post/create", {
          method: "POST",
          credentials: "include",
          body: formData,
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

      resetForm();
      setSuccessMessage(
        isDraft ? "Draft saved successfully!" : "Post published successfully!"
      );
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setMediaToRemove([]);
    } catch (error) {
      console.error("Error submitting post:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (renderDraft && renderDraft._id) {
      setTitle(renderDraft.title || "");
      setContent(renderDraft.content || "");
      setSelectedTags(renderDraft.tags || []);
      setDraftPostId(renderDraft.postId || null);
      setExistingMedia(renderDraft.media || []); // set full media objects here
      setMediaFiles([]); // clear new files when loading draft
      setMediaToRemove([]); // clear removed media list on draft load
    } else {
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setDraftPostId(null);
      setExistingMedia([]);
      setMediaFiles([]);
      setMediaToRemove([]);
    }
  }, [renderDraft]);

  return (
    <div className="postMain">
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner" />
        </div>
      )}

      {successMessage && <div className="toast-message">{successMessage}</div>}

      <form
        className="postData"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(true);
        }}
      >
        <div className="createPostDiv">
          <div className="createPost">Create Post</div>
          <div className="x" onClick={() => navigate("/forum")}>
            X
          </div>
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

        {/* Pass existingMedia and handlers to MediaUploader */}
        <MediaUploader
          existingMedia={existingMedia}
          onRemoveExistingMedia={handleRemoveExistingMedia}
          mediaFiles={mediaFiles}
          onMediaChange={handleNewMediaChange}
          onRemoveNewFile={handleRemoveNewFile}
        />

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
