import "./ToPost.css";
import ArrowIcon from "../../assets/Arrow.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
function ToPost() {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <div className="toPost">
      <div className="toPostMain">
        <div className="toSavedPostDiv" onClick={() => navigate("/forum/newpost")}>
          <div className="postNow">{t("Post Now")}</div>
          <img className="postArrow" alt="" src={ArrowIcon} />
        </div>
        <div className="toSavedPostDiv" onClick={() => navigate("/forum/savedpost")}>
          <div className="postNow">{t("Saved Posts")}</div>
          <img className="postArrow" alt="" src={ArrowIcon} />
        </div>
        <div className="toSavedPostDiv" onClick={() => navigate("/forum/mypost")}>
          <div className="postNow">{t("My Posts")}</div>
          <img className="postArrow" alt="" src={ArrowIcon} />
        </div>
      </div>
    </div>
  );
}
export default ToPost;
