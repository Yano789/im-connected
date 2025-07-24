import "./Header.css";
import AppIcon from "../../assets/Application.png";
import SearchIcon from "../../assets/Search.png";
import TabBar from "../TabBar/TabBar";
function Header() {
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
        <button className="buttonStyle1" onClick={onFrameContainerClick}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Header;
