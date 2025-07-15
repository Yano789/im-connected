import "./TopicSelector.css";
import Topic from "../Topic/Topic";
function TopicSelector() {
  	return (
    		<div className="topicSelector">
                <div className="topicTitle">
                      <div className="showPostsRelated">Show Posts Related To</div>
                </div>
                <div className="topicTags">
                      <Topic topicName="All" topicImage="src\assets\Book.png"/>
                      <Topic topicName="Physical Disability and Chronic Illness" topicImage="src\assets\Wheelchair.png"/>
                      <Topic topicName="Personal Mental Health" topicImage="src\assets\MentalHealth.png"/>
                      <Topic topicName="Subsidies and Govt Support" topicImage="src\assets\Govt.png"/>
                      <Topic topicName="Pediatric Care" topicImage="src\assets\Children.png"/>
                      <Topic topicName="End of Life Care" topicImage="src\assets\Elderly.png"/>
                      <Topic topicName="Financial and Legal Help" topicImage="src\assets\Money.png"/>
                      <Topic topicName="Mental Disability" topicImage="src\assets\Depression.png"/>
                      <Topic topicName="Hospitals and Clinics" topicImage="src\assets\Hospital.png"/>
                </div>
    		</div>);
};

export default TopicSelector;
