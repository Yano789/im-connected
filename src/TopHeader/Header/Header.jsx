import "./Header.css";
import AppIcon from "../../assets/Application.png";
import SearchIcon from "../../assets/Search.png";
import TabBar from "../TabBar/TabBar";
import { AuthContext } from "../../AuthContext";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../config/api";
import i18next from "i18next";


function Header() {
  const { setUser } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const navigate = useNavigate();
  const {t} = useTranslation();

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
      const res = await fetch(API_ENDPOINTS.USER_LOGOUT, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setUser(null);
        await i18next.changeLanguage("en");
        navigate("/", { replace: true });


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
        API_ENDPOINTS.POST_SEARCH(searchInput),
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
            <i>{t("im")}</i>
            <span className="connected">{t("Connected")}</span>
          </div>
        </div>
        <div className="search">
          <input
            className="typeHereTo"
            placeholder={t("Search")}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setIsFocused(true)}No forum posts with this title
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          />
          <img className="applicationIcon" alt="" src={SearchIcon} />
          {isFocused && searchInput.trim() !== "" && (
            <div className="searchDropdown">
              {searchResults.length === 0 && (
                <div className="searchEntry">
                  {t("No Forum Posts")}
                </div>
              )}
              {searchResults.slice(0, 3).map((item, index) => {
                const title = item.title || "";
                const input = searchInput.trim();
                const encodedPostId = encodeURIComponent(item.postId);

                const matchIndex = title
                  .toLowerCase()
                  .indexOf(input.toLowerCase());

                if (matchIndex === -1) {
                  return (
                    <div className="searchEntry" key={index}>
                      {title}
                    </div>
                  );
                }

                const before = title.slice(0, matchIndex);
                const match = title.slice(
                  matchIndex,
                  matchIndex + input.length
                );
                const after = title.slice(matchIndex + input.length);

                return (
                  <div
                    className="searchEntry"
                    key={index}
                    onClick={() => {
                      setIsFocused(false);
                      navigate(`/forum/viewpost?postId=${encodedPostId}`);
                    }}
                  >
                    {before}
                    <span className="highlightMatch">{match}</span>
                    {after}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <TabBar></TabBar>
        <button className="buttonStyle1" onClick={handleLogout}>
          {t("Sign Out")}
        </button>
      </div>
    </div>
  );
}

export default Header;
