import "./Filter.css";
import Topic from "../Topic/Topic";
import { useState } from "react";

function Filter() {
  const [clicked, setClicked] = useState(null);

  const handleFilterClicked = (topicId) => {
    setClicked(topicId);
  };

  return (
    <div className="filterBy">
      <div className="filterMain">
        <div className="filterText">Filter By</div>

        <Topic topicId={1} topicName="Newest Post" topicImage="src/assets/Latest.png"
               clicked={clicked === 1} onClick={() => handleFilterClicked(1)} />

        <Topic topicId={2} topicName="Oldest Post" topicImage="src/assets/Earliest.png"
               clicked={clicked === 2} onClick={() => handleFilterClicked(2)} />

        <Topic topicId={3} topicName="Highest Comments" topicImage="src/assets/Comments.png"
               clicked={clicked === 3} onClick={() => handleFilterClicked(3)} />

        <Topic topicId={4} topicName="Highest Likes" topicImage="src/assets/Likes.png"
               clicked={clicked === 4} onClick={() => handleFilterClicked(4)} />
      </div>
    </div>
  );
}

export default Filter;
