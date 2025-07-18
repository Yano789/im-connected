import NewPost from "../NewPost/NewPost";
import DraftPosts from "../DraftPosts/DraftPosts";
import "./NewPostBody.css";
function NewPostBody(){
    return (
        <div className="newPostsBody">
            <NewPost/>
            <DraftPosts/>
        </div>
    );
}
export default NewPostBody;