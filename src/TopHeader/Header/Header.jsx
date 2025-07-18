import "./Header.css"
import TabBar from "../TabBar/TabBar";
function Header(){
    const onFrameContainerClick = () => {
    };


  	
  	return (
    		<div class="header">
      			<div class="headerMain">
        				<div class="sitelogo">
          					<img class="applicationIcon" alt="" src="src\assets\Application.png" />
          					<div class="imconnected">
            						<i>im</i>
            						<span class="connected">Connected</span>
          					</div>
        				</div>
        				<div class="search">
          					<div class="title">
            						<div class="typeHereTo">Type here to search...</div>
            						<img class="applicationIcon" alt="" src="src\assets\Search.png" />
          					</div>
        				</div>
						<TabBar></TabBar>
						<button class="buttonStyle1" onClick={onFrameContainerClick}>Sign Out</button>
      			</div>
    		</div>
			);
};

export default Header;