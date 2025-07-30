import "./Header.css";
import AppIcon from "../../assets/Application.png";
import SearchIcon from "../../assets/Search.png";
import TabBar from "../TabBar/TabBar";
import { AuthContext } from "../../AuthContext";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const { setUser } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchInput.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSearchResults(searchInput);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

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
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const fetchSearchResults = async (searchInput) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/v1/post/getPost/search/${encodeURIComponent(searchInput)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data = await res.json();
      console.log("API data:", data);
      setSearchResults(data);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    }
  };

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
          <input
            className="typeHereTo"
            placeholder="Type here to search..."
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <img className="applicationIcon" alt="" src={SearchIcon} />
          <div className="searchDropdown">
            {searchResults.length === 0 && (
              <div className="searchEntry">No forum posts with this title</div>
            )}
            {searchResults.slice(0,3).map((item, index) => (
              <div className="searchEntry" key={index}>
                {item.title}
              </div>
            ))}
          </div>
        </div>
        <TabBar></TabBar>
        <button className="buttonStyle1" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Header;
