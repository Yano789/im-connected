import NewPostCard from "../NewPostCard/NewPostCard";
import DraftPosts from "../DraftPosts/DraftPosts";
import "./NewPostBody.css";
function NewPostBody(){
    return (
        <div className="newPostDiv">
            <div className="newPostBody">
                <NewPostCard/>
            </div>
            <DraftPosts/>
        </div>
    );
}
export default NewPostBody;