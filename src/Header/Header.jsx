import styles from './Header.module.css';
function Header(){
    const onFrameContainerClick = () => {
    };


  	
  	return (
    		<div className={styles.header}>
      			<div className={styles.main}>
        				<div className={styles.sitelogo}>
          					<img className={styles.applicationIcon} alt="" src="src\assets\Application.png" />
          					<div className={styles.imconnected}>
            						<i>im</i>
            						<span className={styles.connected}>Connected</span>
          					</div>
        				</div>
        				<div className={styles.search}>
          					<div className={styles.title}>
            						<div className={styles.typeHereTo}>Type here to search...</div>
            						<img className={styles.applicationIcon} alt="" src="src\assets\Search.png" />
          					</div>
        				</div>
        				<div className={styles.icons}>
          					<div className={styles.currentPage}>
            						<img className={styles.applicationIcon} alt="" src="src\assets\Home.png" />
            						<div className={styles.dashboard}>Dashboard</div>
          					</div>
          					<div className={styles.navigateTo} onClick={onFrameContainerClick}>
            						<img className={styles.applicationIcon} alt="" src="src\assets\Communication.png" />
            						<div className={styles.dashboard}>Forum</div>
          					</div>
          					<div className={styles.navigateTo} onClick={onFrameContainerClick}>
            						<img className={styles.applicationIcon} alt="" src="src\assets\Pill.png" />
            						<div className={styles.dashboard}>Medication</div>
          					</div>
          					<div className={styles.navigateTo} onClick={onFrameContainerClick}>
            						<img className={styles.applicationIcon} alt="" src="src\assets\Bot.png" />
            						<div className={styles.dashboard}>Chatbot</div>
          					</div>
          					<div className={styles.navigateTo} onClick={onFrameContainerClick}>
            						<img className={styles.applicationIcon} alt="" src="src\assets\User.png" />
            						<div className={styles.dashboard}>Profile</div>
          					</div>
        				</div>
						<button className={styles.buttonStyle1} onClick={onFrameContainerClick}>Sign Out</button>
      			</div>
    		</div>);
};

export default Header;
