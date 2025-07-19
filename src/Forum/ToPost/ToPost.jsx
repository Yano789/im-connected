import "./ToPost.css";
import ArrowIcon from "../../assets/Arrow.png";
import { useNavigate } from "react-router-dom";
function ToPost() {
  const navigate = useNavigate();

  return (
    <div className="toPost">
      <div className="toPostMain">
        <div className="toPostTitle" onClick={() => navigate("/forum/newpost")}>
          <div className="postNow">Post Now</div>
          <div className="postDrafts">Drafts</div>
        </div>
        <div className="toSavedPostDiv">
          <div className="postNow">Saved Posts</div>
          <img className="postArrow" alt="" src={ArrowIcon} />
        </div>
      </div>
    </div>
  );
}
export default ToPost;
