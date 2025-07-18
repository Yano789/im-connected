import "./TopicSelector.css";
import Topic from "../Topic/Topic";
import { useState } from "react";

const TAGS = [
  { id: 1, name: "All", image: "src/assets/Book.png" },
  {
    id: 2,
    name: "Physical Disability & Chronic Illness",
    image: "src/assets/Wheelchair.png",
  },
  {
    id: 3,
    name: "Personal Mental Health",
    image: "src/assets/MentalHealth.png",
  },
  { id: 4, name: "Subsidies and Govt Support", image: "src/assets/Govt.png" },
  { id: 5, name: "Pediatric Care", image: "src/assets/Children.png" },
  { id: 6, name: "End of Life Care", image: "src/assets/Elderly.png" },
  { id: 7, name: "Financial & Legal Help", image: "src/assets/Money.png" },
  { id: 8, name: "Mental Disability", image: "src/assets/Depression.png" },
  { id: 9, name: "Hospitals and Clinics", image: "src/assets/Hospital.png" },
];

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

    if (updatedTopics.includes(1)) {
      onTagFilterChange("");
      return;
    }

    const selectedTagNames = updatedTopics
      .map((id) => TAGS.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .join(",");

    onTagFilterChange(selectedTagNames);
  };

  return (
    <div className="topicSelector">
      <div className="topicTitle">
        <div className="showPostsRelated">Show Posts Related To</div>
      </div>
      <div className="topicTags">
        {TAGS.map(({ id, name, image }) => (
          <Topic
            key={id}
            topicId={id}
            topicName={name}
            topicImage={image}
            onClick={() => handleTopicClicked(id)}  
            clicked={clickedTopics.includes(id)}
          />
        ))}
      </div>
    </div>
  );
}

export default TopicSelector;
