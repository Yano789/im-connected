import "./ForumBody.css";
import ForumCard from "../ForumCard/ForumCard";
import Filter from "../Filter/Filter";
import ToPost from "../ToPost/ToPost";
import TopicSelector from "../TopicSelector/TopicSelector";
function ForumBody(){
    //const forumData = props.forumData;
    
    return (
        <div className="forumMain">
            <div className="forumLeftBar">
                 <ToPost/>
                <Filter/>
            </div>

            <div className="forumBody">
                <ForumCard postUser="Camellia Tan" postDate="7/15/2025" postTitle="I fell down" postTags={["lol tag 1", "test tag 2"]} postDescription="HI I FELL DOWN I AM BLEEDING HELP"/>
                <ForumCard postUser="Leanne Chua" postDate="1/1/2000" postTitle="test" postTags={["lol tag 1", null]} postDescription="description insert here"/>
            </div>
            <div className="forumRightBar">
                <TopicSelector/>
            </div>
        </div>  
    );

}
export default ForumBody; 