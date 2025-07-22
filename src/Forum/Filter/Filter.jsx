import "./Filter.css";
import LatestIcon from "../../assets/Latest.png";
import EarliestIcon from "../../assets/Earliest.png";
import CommentsIcon from "../../assets/Comments.png";
import LikesIcon from "../../assets/Likes.png";
import Topic from "../Topic/Topic";
import { useState } from "react";

function Filter({ onFilter }) {
  const [clicked, setClicked] = useState(null);

  const handleFilterClicked = (topicId) => {
    setClicked(topicId);

    // Trigger the parent's filter handler
    if (onFilter) {
      switch (topicId) {
        case 1:
          onFilter({ sort: "latest" });
          break;
        case 2:
          onFilter({ sort: "earliest" });
          break;
        case 3:
          onFilter({ sort: "most comments" });
          break;
        case 4:
          onFilter({ sort: "most likes" });
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="filterBy">
      <div className="filterMain">
        <div className="filterText">Filter By</div>

        <Topic
          topicId={1}
          topicName="Newest Post"
          topicImage={LatestIcon}
          clicked={clicked === 1}
          onClick={() => handleFilterClicked(1)}
        />

        <Topic
          topicId={2}
          topicName="Oldest Post"
          topicImage={EarliestIcon}
          clicked={clicked === 2}
          onClick={() => handleFilterClicked(2)}
        />

        <Topic
          topicId={3}
          topicName="Highest Comments"
          topicImage={CommentsIcon}
          clicked={clicked === 3}
          onClick={() => handleFilterClicked(3)}
        />

        <Topic
          topicId={4}
          topicName="Highest Likes"
          topicImage={LikesIcon}
          clicked={clicked === 4}
          onClick={() => handleFilterClicked(4)}
        />
      </div>
    </div>
  );
}

export default Filter;
