import "./TopicSelector.css";
import AllIcon from "../../assets/Book.png";
import WheelchairIcon from "../../assets/Wheelchair.png";
import MentalHealthIcon from "../../assets/MentalHealth.png";
import GovtIcon from "../../assets/Govt.png";
import ChildrenIcon from "../../assets/Children.png";
import ElderlyIcon from "../../assets/Elderly.png";
import MoneyIcon from "../../assets/Money.png";
import DepressionIcon from "../../assets/Depression.png";
import HospitalIcon from "../../assets/Hospital.png";

import Topic from "../Topic/Topic";
import { useState } from "react";
const TAGS = [
  { id: 1, name: "All", image: AllIcon },
  { id: 2, name: "Physical Disability & Chronic Illness", image: WheelchairIcon },
  { id: 3, name: "Personal Mental Health", image: MentalHealthIcon },
  { id: 4, name: "Subsidies and Govt Support", image: GovtIcon },
  { id: 5, name: "Pediatric Care", image: ChildrenIcon },
  { id: 6, name: "End of Life Care", image: ElderlyIcon },
  { id: 7, name: "Financial & Legal Help", image: MoneyIcon },
  { id: 8, name: "Mental Disability", image: DepressionIcon },
  { id: 9, name: "Hospitals and Clinics", image: HospitalIcon },
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
