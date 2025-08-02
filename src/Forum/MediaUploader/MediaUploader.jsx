import { useRef } from "react";
import "./MediaUploader.css";
import { useTranslation } from "react-i18next";

function MediaUploader({
  existingMedia = [],
  onRemoveExistingMedia,
  mediaFiles = [],
  onMediaChange,
  onRemoveNewFile,
}) {
  const fileInputRef = useRef(null);
  const {t} = useTranslation();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onMediaChange([...mediaFiles, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onMediaChange([...mediaFiles, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="mediaUploader">
      <div
        className="dropArea"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
      >
        {t("Add Media")}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* Existing media (from backend) */}
      {existingMedia.length > 0 && (
        <div className="existingMediaContainer">
          <h4>Previously Uploaded:</h4>
          <div className="mediaPreviewGrid">
            {existingMedia.map((media, index) => (
              <div className="mediaItem" key={index}>
                {media.type.startsWith("image") ? (
                  <img src={media.url} alt={`media-${index}`} />
                ) : (
                  <video src={media.url} controls />
                )}
                <button
                  type="button"
                  className="removeMediaBtn"
                  onClick={() => onRemoveExistingMedia(media.public_id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New media (not uploaded yet) */}
      {mediaFiles.length > 0 && (
        <div className="newMediaContainer">
          <h4>New Media:</h4>
          <div className="mediaPreviewGrid">
            {mediaFiles.map((file, index) => {
              const previewURL = URL.createObjectURL(file);
              return (
                <div className="mediaItem" key={index}>
                  {file.type.startsWith("image") ? (
                    <img src={previewURL} alt={`new-${index}`} />
                  ) : (
                    <video src={previewURL} controls />
                  )}
                  <button
                    type="button"
                    className="removeMediaBtn"
                    onClick={() => onRemoveNewFile(index)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaUploader;

