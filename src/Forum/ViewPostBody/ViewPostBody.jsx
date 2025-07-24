import ViewPostCard from "../ViewPostCard/ViewPostCard";
import ToPost from "../ToPost/ToPost";

function ViewPostBody() {
  return (
    <div className="forumMain">
      <div className="forumLeftBar">
        <ToPost />
      </div>
      <div className="forumBody">
        <ViewPostCard/>
      </div>
    </div>
  );
}
export default ViewPostBody;
