import "./TabBar.css"
function TabBar() {
        const onFrameContainerClick = () => {
    };


  return (
    <div className="icons">
          					<div className="currentPage">
            						<img className="applicationIcon" alt="" src="src\assets\Home.png" />
            						<div className="dashboard">Dashboard</div>
          					</div>
          					<div className="navigateTo" onClick={onFrameContainerClick}>
            						<img className="applicationIcon" alt="" src="src\assets\Communication.png" />
            						<div className="dashboard">Forum</div>
          					</div>
          					<div className="navigateTo" onClick={onFrameContainerClick}>
            						<img className="applicationIcon" alt="" src="src\assets\Pill.png" />
            						<div className="dashboard">Medication</div>
          					</div>
          					<div className="navigateTo" onClick={onFrameContainerClick}>
            						<img className="applicationIcon" alt="" src="src\assets\Bot.png" />
            						<div className="dashboard">Chatbot</div>
          					</div>
          					<div className="navigateTo" onClick={onFrameContainerClick}>
            						<img className="applicationIcon" alt="" src="src\assets\User.png" />
            						<div className="dashboard">Profile</div>
          					</div>
    </div>
   
  )
}

export default TabBar
