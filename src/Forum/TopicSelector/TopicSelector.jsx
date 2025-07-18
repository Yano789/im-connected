import "./TopicSelector.css";
import Topic from "../Topic/Topic";
import { useState } from "react";

function TopicSelector({ onTagFilterChange }) {
  const [clickedTopics, setClickedTopics] = useState([]);

  const handleTopicClicked = (topicId) => {
    let updatedTopics;
    if (clickedTopics.includes(topicId)) {
      updatedTopics = clickedTopics.filter((id) => id !== topicId);
    } else {
      updatedTopics =
        clickedTopics.length < 2 ? [...clickedTopics, topicId] : clickedTopics;
    }

    setClickedTopics(updatedTopics);

    // Notify parent of tag filter change
    if (onTagFilterChange) {
      onTagFilterChange(updatedTopics);
    }
  };

  return (
    <div className="topicSelector">
      <div className="topicTitle">
        <div className="showPostsRelated">Show Posts Related To</div>
      </div>
      <div className="topicTags">
        <Topic
          topicId={1}
          topicName="All"
          topicImage="src/assets/Book.png"
          onClick={() => handleTopicClicked(1)}
          clicked={clickedTopics.includes(1)}
        />
        <Topic
          topicId={2}
          topicName="Physical Disability and Chronic Illness"
          topicImage="src/assets/Wheelchair.png"
          onClick={() => handleTopicClicked(2)}
          clicked={clickedTopics.includes(2)}
        />
        <Topic
          topicId={3}
          topicName="Personal Mental Health"
          topicImage="src/assets/MentalHealth.png"
          onClick={() => handleTopicClicked(3)}
          clicked={clickedTopics.includes(3)}
        />
        <Topic
          topicId={4}
          topicName="Subsidies and Govt Support"
          topicImage="src/assets/Govt.png"
          onClick={() => handleTopicClicked(4)}
          clicked={clickedTopics.includes(4)}
        />
        <Topic
          topicId={5}
          topicName="Pediatric Care"
          topicImage="src/assets/Children.png"
          onClick={() => handleTopicClicked(5)}
          clicked={clickedTopics.includes(5)}
        />
        <Topic
          topicId={6}
          topicName="End of Life Care"
          topicImage="src/assets/Elderly.png"
          onClick={() => handleTopicClicked(6)}
          clicked={clickedTopics.includes(6)}
        />
        <Topic
          topicId={7}
          topicName="Financial and Legal Help"
          topicImage="src/assets/Money.png"
          onClick={() => handleTopicClicked(7)}
          clicked={clickedTopics.includes(7)}
        />
        <Topic
          topicId={8}
          topicName="Mental Disability"
          topicImage="src/assets/Depression.png"
          onClick={() => handleTopicClicked(8)}
          clicked={clickedTopics.includes(8)}
        />
        <Topic
          topicId={9}
          topicName="Hospitals and Clinics"
          topicImage="src/assets/Hospital.png"
          onClick={() => handleTopicClicked(9)}
          clicked={clickedTopics.includes(9)}
        />
      </div>
    </div>
  );
}

export default TopicSelector;
