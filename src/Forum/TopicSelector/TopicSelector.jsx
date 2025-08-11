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
import { useTranslation } from "react-i18next";

function TopicSelector({ onTagFilterChange, clickedTopics = [] }) {
  const { t } = useTranslation();

  const TAGS = [
    { id: 1, name: "All", localName: t("Tag1"), image: AllIcon },
    {
      id: 2,
      name: "Physical Disability & Chronic Illness",
      localName: t("Tag2"),
      image: WheelchairIcon,
    },
    {
      id: 3,
      name: "Personal Mental Health",
      localName: t("Tag3"),
      image: MentalHealthIcon,
    },
    {
      id: 4,
      name: "Subsidies and Govt Support",
      localName: t("Tag4"),
      image: GovtIcon,
    },
    {
      id: 5,
      name: "Pediatric Care",
      localName: t("Tag5"),
      image: ChildrenIcon,
    },
    {
      id: 6,
      name: "End of Life Care",
      localName: t("Tag6"),
      image: ElderlyIcon,
    },
    {
      id: 7,
      name: "Financial & Legal Help",
      localName: t("Tag7"),
      image: MoneyIcon,
    },
    {
      id: 8,
      name: "Mental Disability",
      localName: t("Tag8"),
      image: DepressionIcon,
    },
    {
      id: 9,
      name: "Hospitals and Clinics",
      localName: t("Tag9"),
      image: HospitalIcon,
    },
  ];

  const handleTopicClicked = (topicId) => {
    if (topicId === 1) {
      onTagFilterChange([1]);
      return;
    }

    const topicsExcludingAll = clickedTopics.filter((id) => id !== 1);
    let updatedTopics;

    if (topicsExcludingAll.includes(topicId)) {
      updatedTopics = topicsExcludingAll.filter((id) => id !== topicId);
      if (updatedTopics.length === 0) {
        updatedTopics = [1];
      }
    } else {
      if (topicsExcludingAll.length >= 2) return;
      updatedTopics = [...topicsExcludingAll, topicId];
    }

    onTagFilterChange(updatedTopics);
  };

  return (
    <div className="topicSelector">
      <div className="topicTitle">
        <div className="showPostsRelated">{t("TopicSelectorHeader")}</div>
      </div>
      <div className="topicTags">
        {TAGS.map(({ id, localName, image }) => (
          <Topic
            key={id}
            topicId={id}
            topicName={localName}
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
