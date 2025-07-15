import "./Filter.css";
function Filter() {
  return (
    <div className="filterBy">
      <div className="filterMain">
        <div className="filterText">Filter By</div>
        <div className="filterType">
          <div className="filterTypeDiv">
            <img className="filterIcon" alt="newest posts" src="src\assets\Latest.png" />
            <div className="filterTypeText">Newest Posts</div>
          </div>
        </div>
        <div className="filterType">
          <div className="filterTypeDiv">
            <img className="filterIcon" alt="oldest posts" src="src\assets\Earliest.png" />
            <div className="filterTypeText">Oldest Posts</div>
          </div>
        </div>
        <div className="filterType">
          <div className="filterTypeDiv">
            <img className="filterIcon" alt="highest comments" src="src\assets\Comments.png" />
            <div className="filterTypeText">Highest Comments</div>
          </div>
        </div>
        <div className="filterType">
          <div className="filterTypeDiv">
            <img className="filterIcon" alt="highest likes" src="src\assets\Likes.png" />
            <div className="filterTypeText">Highest Likes</div>
          </div>
        </div>
        </div>
      </div>
  );
}

export default Filter;
