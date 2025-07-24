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
    <div class="header">
      <div class="headerMain">
        <div class="sitelogo">
          <img class="applicationIcon" alt="" src={AppIcon} />
          <div class="imconnected">
            <i>im</i>
            <span class="connected">Connected</span>
          </div>
        </div>
        <div class="search">
          <textarea class="typeHereTo">Type here to search...</textarea>
          <img class="applicationIcon" alt="" src={SearchIcon} />
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
