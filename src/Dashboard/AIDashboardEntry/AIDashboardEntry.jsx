import "./AIDashboardEntry.css";
function AIDashboardEntry(props){
    const itemTitle = props.itemTitle;
    const itemName = props.itemName;
    const onClick = props.onClick;
    return (
        <div className="itemDiv" onClick={onClick}>
            <div className="itemBox">
                <div className="itemName">{itemName}</div>
                <div className="itemTitle">{itemTitle}</div>
            </div>
        </div>
    );
};
export default AIDashboardEntry;