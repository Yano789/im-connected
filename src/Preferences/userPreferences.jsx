import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "./userPreferences.css";
import Children from "../assets/Children.png";
import Depression from "../assets/Depression.png";
import Elderly from "../assets/Elderly.png";
import Govt from "../assets/Govt.png";
import Hospital from "../assets/Hospital.png";
import MentalHealth from "../assets/MentalHealth.png";
import Money from "../assets/Money.png";
import Wheelchair from "../assets/Wheelchair.png";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { applyTextSize } from "../Profile/TextSize";

const UserPreferences = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedTextSize, setSelectedTextSize] = useState("Medium");
  const [selectedContentMode, setSelectedContentMode] = useState("Easy Read");
  const [selectedTopics, setSelectedTopics] = useState([]);

  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // Load saved preferences and apply initial text size when component loads
  useEffect(() => {
    console.log("useEffect running - loading preferences");
    const savedPreferences = localStorage.getItem("preferences");
    console.log("Saved preferences:", savedPreferences);
    
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        console.log("Parsed preferences:", preferences);
        
        if (preferences.textSize) {
          console.log("Setting text size to:", preferences.textSize);
          setSelectedTextSize(preferences.textSize);
          applyTextSize(preferences.textSize);
        }
        if (preferences.language) {
          console.log("Setting language to:", preferences.language);
          setSelectedLanguage(preferences.language);
          i18next.changeLanguage(preferences.language);
        }
        if (preferences.contentMode) {
          setSelectedContentMode(preferences.contentMode);
        }
        if (preferences.topics) {
          setSelectedTopics(preferences.topics);
        }
      } catch (error) {
        console.error("Error loading saved preferences:", error);
      }
    } else {
      // Apply default text size if no saved preferences
      console.log("No saved preferences, applying default text size:", selectedTextSize);
      applyTextSize(selectedTextSize);
    }
  }, []);

  const languages = [
    { id: "en", label: "English" },
    { id: "zh", label: "华文" },
    { id: "ms", label: "Bahasa Melayu" },
    { id: "ta", label: "தமிழ்" },
  ];

  const textSizes = [
    { id: "Small", label: "Small", fontSize: "18px" },
    { id: "Medium", label: "Medium", fontSize: "24px" },
    { id: "Large", label: "Big", fontSize: "32px" },
  ];

  const getContentModes = () => [
    { id: "Easy Read", label: t("Easy Reader Mode") },
    { id: "Default", label: t("Default Mode") },
  ];

  const getCareRecipientTopics = () => [
    {
      id: "physical-disability",
      label: t("Physical Disability & Chronic Illness"),
      englishLabel: "Physical Disability & Chronic Illness",
      icon: <img src={Wheelchair} alt="Wheelchair" />,
    },
    {
      id: "end-of-life",
      label: t("End of Life Care"),
      englishLabel: "End of Life Care",
      icon: <img src={Elderly} alt="Elderly" />,
    },
    {
      id: "mental-disability",
      label: t("Mental Disability"),
      englishLabel: "Mental Disability",
      icon: <img src={Depression} alt="Depression" />,
    },
    {
      id: "pediatric-care",
      label: t("Pediatric Care"),
      englishLabel: "Pediatric Care",
      icon: <img src={Children} alt="Children" />,
    },
  ];

  const getCaregiverTopics = () => [
    {
      id: "personal-mental-health",
      label: t("Personal Mental Health"),
      englishLabel: "Personal Mental Health",
      icon: <img src={MentalHealth} alt="MentalHealth" />,
    },
    {
      id: "financial-legal",
      label: t("Financial & Legal Help"),
      englishLabel: "Financial & Legal Help",
      icon: <img src={Money} alt="Money" />,
    },
    {
      id: "hospitals",
      label: t("Hospitals and Clinics"),
      englishLabel: "Hospitals and Clinics",
      icon: <img src={Hospital} alt="Hospital" />,
    },
    {
      id: "subsidies-govt",
      label: t("Subsidies and Govt Support"),
      englishLabel: "Subsidies and Govt Support",
      icon: <img src={Govt} alt="Govt" />,
    },
  ];

  const handleTopicToggle = (topicId) => {
    // Find the topic by ID to get the English label
    const allTopics = [...getCareRecipientTopics(), ...getCaregiverTopics()];
    const topic = allTopics.find(t => t.id === topicId);
    
    if (!topic) return;
    
    setSelectedTopics((prev) => {
      if (prev.includes(topic.englishLabel)) {
        //if already selected, remove it
        return prev.filter((label) => label !== topic.englishLabel);
      } else if (prev.length < 2) {
        //if less than 2 selected, add it
        return [...prev, topic.englishLabel];
      }
      //if 2 are already selected and this isn't one of them, do nothing
      return prev;
    });
  };

  const handlePreferenceChange = async (category, value) => {
    console.log("handlePreferenceChange called:", category, value);
    
    // Update local state immediately
    if (category === "language") {
      setSelectedLanguage(value);
      i18next.changeLanguage(value);
      console.log("Language changed to:", value);
    } else if (category === "textSize") {
      setSelectedTextSize(value);
      applyTextSize(value);
      console.log("Text size changed to:", value);
    } else if (category === "contentMode") {
      setSelectedContentMode(value);
      console.log("Content mode changed to:", value);
    }

    // Save to backend immediately
    const preferences = {
      language: category === "language" ? value : selectedLanguage,
      textSize: category === "textSize" ? value : selectedTextSize,
      contentMode: category === "contentMode" ? value : selectedContentMode,
      topics: selectedTopics,
    };

    try {
      const res = await fetch("http://localhost:5001/api/v1/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, ...preferences }),
      });

      if (res.ok) {
        console.log("Preference updated:", category, value);
        localStorage.setItem("preferences", JSON.stringify(preferences));
      } else {
        console.error("Failed to update preference:", category, value);
      }
    } catch (err) {
      console.error("Error updating preference:", err);
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    console.log("User preferences:", {
      language: selectedLanguage,
      textSize: selectedTextSize,
      contentMode: selectedContentMode,
      topics: selectedTopics,
    });

    const preferences = {
      language: selectedLanguage,
      textSize: selectedTextSize,
      contentMode: selectedContentMode,
      topics: selectedTopics,
    };

    try {
      const res = await fetch("http://localhost:5001/api/v1/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, ...preferences }),
      });

      const data = await res.json();
      console.log("Preferences response:", data);

      if (res.ok) {
        console.log("Preference saved:", data);
        localStorage.setItem("preferences", JSON.stringify(preferences));

        if (data.user) {
          setUser(data.user);
        }
        localStorage.removeItem("canVerifyEmail");

        navigate("/forum");
      } else {
        console.log("Failed to save preferences:", data);
        alert(
          `Failed to save preferences: ${data.error || JSON.stringify(data)}`
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences. Network error.");
    }
  };

  return (
    <div className="preferences-container" key={selectedLanguage}>
      <div className="signup-preferences-card">
        <div className="preferences-content">
          <div className="header-section">
            <h1 className="greeting">{t("Hi")} {username}!</h1>
            <p className="subtitle">{t("We want to get to know you better")}</p>
          </div>

          <div className="main-content">
            <div className="left-column">
              <div className="signup-preference-group">
                <label className="signup-preference-label">
                  {t("Preferred Language")}
                </label>
                <div className="language-options">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      className={`language-btn ${
                        selectedLanguage === lang.id ? "selected" : ""
                      }`}
                      onClick={() => handlePreferenceChange("language", lang.id)}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="signup-preference-group">
                <label className="signup-preference-label">{t("Text Size")}</label>
                <div className="text-size-options">
                  {textSizes.map((size) => (
                    <button
                      key={size.id}
                      className={`text-size-btn ${
                        selectedTextSize === size.id ? "selected" : ""
                      }`}
                      onClick={() => handlePreferenceChange("textSize", size.id)}
                      style={{ fontSize: size.fontSize }}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="signup-preference-group">
                <label className="signup-preference-label">{t("Content Mode")}</label>
                                 <div className="content-mode-options">
                   {getContentModes().map((mode) => (
                    <div
                      key={mode.id}
                      className={`content-mode-card ${
                        selectedContentMode === mode.id ? "selected" : ""
                      }`}
                      onClick={() => handlePreferenceChange("contentMode", mode.id)}
                    >
                      <div className="mode-preview">
                        <div className="preview-image"></div>
                        {mode.id === "Easy Read" && (
                          <>
                            <div className="preview-elements">
                              <div className="preview-bar"></div>
                              <div className="preview-circles">
                                <div className="preview-circle"></div>
                                <div className="preview-circle"></div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="mode-label">{mode.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="right-column">
              <div className="signup-preference-group">
                <label className="signup-preference-label">
                  {t("Topics Interested In")}
                </label>

                <div className="topics-header">
                  <span>{t("For Care Recipient")}</span>
                  <span>{t("For Caregiver")}</span>
                </div>

                <div className="topics-grid">
                                     <div className="topics-column">
                     {getCareRecipientTopics().map((topic) => {
                      const isSelected = selectedTopics.includes(topic.englishLabel);
                      const isDisabled =
                        !isSelected && selectedTopics.length >= 2;
                      return (
                        <button
                          key={topic.id}
                          className={`topic-btn ${
                            isSelected ? "selected" : ""
                          } ${isDisabled ? "disabled" : ""}`}
                          onClick={() => handleTopicToggle(topic.id)}
                        >
                          <span className="topic-icon">{topic.icon}</span>
                          <span className="topic-text">{topic.label}</span>
                        </button>
                      );
                    })}
                  </div>

                                     <div className="topics-column">
                     {getCaregiverTopics().map((topic) => {
                      const isSelected = selectedTopics.includes(topic.englishLabel);
                      const isDisabled =
                        !isSelected && selectedTopics.length >= 2;

                      return (
                        <button
                          key={topic.id}
                          className={`topic-btn ${
                            isSelected ? "selected" : ""
                          } ${isDisabled ? "disabled" : ""}`}
                          onClick={() => handleTopicToggle(topic.id)}
                          disabled={isDisabled}
                        >
                          <span className="topic-icon">{topic.icon}</span>
                          <span className="topic-text">{topic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <button className="continue-btn" onClick={handleContinue}>
              {t("Continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
