import "./Header.css";
import AppIcon from "../../assets/Application.png";
import SearchIcon from "../../assets/Search.png";
import TabBar from "../TabBar/TabBar";
function Header() {
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
        <button class="buttonStyle1" onClick={onFrameContainerClick}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Header;
