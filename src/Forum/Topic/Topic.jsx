import "./Topic.css";
function Topic(prop) {
  const topicName = prop.topicName;
  const topicImage = prop.topicImage;

  return (
    <div className="topicDiv">
      <div className="topicMain">
        <img className="topicImage" alt="topicImage" src={topicImage} />
        <div className="topicName">{topicName}</div>
      </div>
    </div>
  );
}
export default Topic;
