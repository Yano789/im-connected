import "./DraftEntry.css";
import TrashIcon from "../../assets/Trash.png";
function DraftEntry({
  draftPostId,
  draftTitle,
  draftDate,
  draftContents,
  onDelete,
  onClick,
}) {
  return (
    <div className="draftEntryDiv" onClick={onClick}>
      <div className="draftTitle">{draftTitle}</div>
      <div className="draftText">{draftContents}</div>
      <div className="draftDateDiv">
        <div className="draftDate">{draftDate}</div>
        <img
          className="draftDelete"
          alt="Delete"
          src={TrashIcon}
          onClick={(e) => {
          e.stopPropagation();
          onDelete(draftPostId);
        }}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};
export default DraftEntry;

