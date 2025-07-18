import "./DraftEntry.css"
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
        				<img className="draftDelete" alt="" src="src\assets\Trash.png" />
      			</div>
    		</div>);
};

export default DraftEntry;
