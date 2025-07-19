import ViewPostCard from "../ViewPostCard/ViewPostCard";
import ToPost from "../ToPost/ToPost";

function ViewPostBody() {
  return (
    <div className="forumMain">
      <div className="forumLeftBar">
        <ToPost />
      </div>
      <div className="forumBody">
        <ViewPostCard
          viewPostTitle="abc"
          viewPostDate="1/1/1111"
          viewPostUsername="insertName"
          viewPostContents="blah blah"
          viewPostTags={["tagies 1", "tagies 2"]}
          viewPostLikes={0}
          viewPostComments={0}
        />
      </div>
    </div>
  );
}
export default ViewPostBody;
