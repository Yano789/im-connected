import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NewPostCard.css";
import MediaUploader from "../MediaUploader/MediaUploader.jsx";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../config/api.js";

function NewPostCard({ onDraftAdded, renderDraft }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [draftPostId, setDraftPostId] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaToRemove, setMediaToRemove] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const tags = [
    {
      key: "Physical Disability & Chronic Illness",
      label: t("Tag2"),
    },
    { key: "Personal Mental Health", label: t("Tag3") },
    { key: "Subsidies and Govt Support", label: t("Tag4") },
    { key: "Pediatric Care", label: t("Tag5") },
    { key: "End of Life Care", label: t("Tag6") },
    { key: "Finacial & Legal Help", label: t("Tag7") },
    { key: "Mental Disability", label: t("Tag8") },
    { key: "Hospitals and Clinics", label: t("Tag9") },
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

  const handleNewMediaChange = (files) => {
    setMediaFiles(files);
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRemoveExistingMedia = (public_idToRemove) => {
    setExistingMedia((prev) =>
      prev.filter((media) => media.public_id !== public_idToRemove)
    );
    setMediaToRemove((prev) => [...prev, public_idToRemove]);
  };

  const handleSubmit = async (isDraft = true) => {
    setErrorMessage("");
    if (!isDraft) {
      if (!title.trim()) {
        setErrorMessage(t("Title is required"));
        return;
      }
      if (!content.trim()) {
        setErrorMessage(t("Content is required"));
        return;
      }
      if (content.trim().length < 20) {
        setErrorMessage(t("Content must be at least 20 characters"));
        return;
      }
      if (selectedTags.length === 0) {
        setErrorMessage(t("Please select at least 1 tag (max 2)"));
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);
      formData.append("draft", isDraft);
      selectedTags.forEach((tag) => formData.append("tags", tag));
      mediaFiles.forEach((file) => formData.append("media", file));
      mediaToRemove.forEach((id) => {
        formData.append("mediaToRemove[]", id);
      });

      let response;

      if (isDraft && draftPostId) {
        const encodedPostId = encodeURIComponent(draftPostId);
        response = await fetch(API_ENDPOINTS.POST_EDIT_DRAFT(encodedPostId), {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
      } else {
        response = await fetch(API_ENDPOINTS.POST_CREATE, {
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
      setExistingMedia(renderDraft.media || []);
      setMediaFiles([]);
      setMediaToRemove([]);
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
          <div className="createPost">{"Create Post"}</div>
          <div className="x" onClick={() => navigate("/forum")}>
            X
          </div>
        </div>

        <div className="postTitleDiv">
          <div className="postTitle">{"Title"}</div>
          <textarea
            className="createPostWrapper"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("Suggest Title Text")}
          />
        </div>

        <div className="postData">
          <div className="selectTagsAssociated">{t("Select Tags")}</div>
          <div className="tags">
            {tags.map((tag) => (
              <div
                key={tag.key}
                className={`newPostTag ${
                  selectedTags.includes(tag.key) ? "newPostTagSelected" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTag(tag.key);
                }}
              >
                <div className="tagText">{tag.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="addTextDiv">
          <div className="addText">{t("Add Text")}</div>
          <textarea
            className="addTextWrapper"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("Add Post Contents")}
          />
        </div>
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
            <div className="tagText">{t("Post")}</div>
          </button>

          <button
            type="button"
            className="buttonStyle2"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(true);
            }}
          >
            <div className="tagText">{t("Save as Draft")}</div>
          </button>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </form>
    </div>
  );
}

export default NewPostCard;
