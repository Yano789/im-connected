import "./Topic.css";

function Topic(prop) {
  const topicName = prop.topicName;
  const topicImage = prop.topicImage;
  const clicked = prop.clicked;
  const onClick = prop.onClick;
  return (
    <div className="topicDiv">
      <div
        className={clicked ? "topicMainClicked" : "topicMainDefault"} // FIXED
        onClick={onClick} // FIXED
      >
        <img className="topicImage" alt="topicImage" src={topicImage} />
        <div className="topicName">{topicName}</div>
      </div>
    </div>
  );
}

export default Topic;
