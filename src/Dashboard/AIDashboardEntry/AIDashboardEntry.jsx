import "./AIDashboardEntry.css";
function AIDashboardEntry(props){
    const itemCat = props.itemCat;
    const itemName = props.itemName;
    return (
        <div className="item-div">
            <div className="item-box">
                <div className="item-cat">{itemCat}</div>
                <div className="item-name">{itemName}</div>
            </div>
        </div>
    );
};
export default AIDashboardEntry;