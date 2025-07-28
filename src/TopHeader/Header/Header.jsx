import "./Header.css";
import AppIcon from "../../assets/Application.png";
import SearchIcon from "../../assets/Search.png";
import TabBar from "../TabBar/TabBar";
import { AuthContext } from "../../AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/v1/user/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setUser(null); 
        navigate("/login", { replace: true });
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const onFrameContainerClick = () => {};

  return (
    <div className="header">
      <div className="headerMain">
        <div className="sitelogo">
          <img className="applicationIcon" alt="" src={AppIcon} />
          <div className="imconnected">
            <i>im</i>
            <span className="connected">Connected</span>
          </div>
        </div>
        <div className="search">
          <textarea className="typeHereTo" defaultValue="Type here to search..."></textarea>
          <img className="applicationIcon" alt="" src={SearchIcon} />
        </div>
        <TabBar></TabBar>
        <button class="buttonStyle1" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Header;
