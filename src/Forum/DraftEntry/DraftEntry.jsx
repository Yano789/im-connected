import "./DraftEntry.css";
import TrashIcon from "../../assets/Trash.png";
function DraftEntry(props){
    const draftTitle = props.draftTitle;
    const draftContents = props.draftContents;
    const draftDate = props.draftDate;
  	return (
    		<div className="draftEntryDiv">
      			<div className="draftTitle">{draftTitle}</div>
      			<div className="draftText">{draftContents}</div>
      			<div className="draftDateDiv">
        				<div className="draftDate">{draftDate}</div>
        				<img className="draftDelete" alt="" src={TrashIcon} />
      			</div>
    		</div>);
};

export default DraftEntry;
