import { useRef, useState } from "react";
import UploadIcon from "../../assets/Upload.png";
import "./mediaUploader.css";

function MediaUploader() {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="media-container">
      <div className="media-label">Add Media (Optional)</div>

      <div
        className="media-dropzone"
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="text-gray-500">Click or Drag & Drop Media Here</p>
        <img src={UploadIcon} alt="Upload" className="media-upload-icon" />
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="media-grid">
          {selectedFiles.map((file, index) => {
            const url = URL.createObjectURL(file);
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            return (
              <div key={index} className="media-preview">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="media-remove-button"
                >
                  ✕
                </button>

                {isImage && <img src={url} alt="" className="media-thumb" />}
                {isVideo && <video src={url} controls className="media-thumb" />}

                <p className="media-filename">{file.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MediaUploader;
