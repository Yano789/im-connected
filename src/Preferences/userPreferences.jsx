import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './userPreferences.css';
import Children from '../assets/Children.png';
import Depression from '../assets/Depression.png';
import Elderly from '../assets/Elderly.png';
import Govt from '../assets/Govt.png';
import Hospital from '../assets/Hospital.png';
import MentalHealth from '../assets/MentalHealth.png';
import Money from '../assets/Money.png';
import Wheelchair from '../assets/Wheelchair.png';

const UserPreferences = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedTextSize, setSelectedTextSize] = useState('Medium');
  const [selectedContentMode, setSelectedContentMode] = useState('Easy Read');
  const [selectedTopics, setSelectedTopics] = useState([]);

  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const languages = [
    { id: 'English', label: 'English' },
    { id: 'Chinese', label: '华文' },
    { id: 'Malay', label: 'Bahasa Melayu' },
    { id: 'Tamil', label: 'தமிழ்' }
  ];

  const textSizes = [
    { id: 'Small', label: 'Small', fontSize: '18px' },
    { id: 'Medium', label: 'Medium', fontSize: '24px' },
    { id: 'Big', label: 'Big', fontSize: '32px' }
  ];

  const contentModes = [
    { id: 'Easy Read', label: 'Easy Reader Mode' },
    { id: 'Default', label: 'Default Mode' }
  ];

  const careRecipientTopics = [
    { id: 'physical-disability', label: 'Physical Disability & Chronic Illness', icon: <img src={Wheelchair} alt="Wheelchair" /> },
    { id: 'end-of-life', label: 'End of Life Care', icon: <img src={Elderly} alt="Elderly" /> },
    { id: 'mental-disability', label: 'Mental Disability', icon: <img src={Depression} alt="Depression" /> },
    { id: 'pediatric-care', label: 'Pediatric Care', icon: <img src={Children} alt="Children" /> }
  ];

  const caregiverTopics = [
    { id: 'personal-mental-health', label: 'Personal Mental Health', icon: <img src={MentalHealth} alt="MentalHealth" /> },
    { id: 'financial-legal', label: 'Financial & Legal Help', icon: <img src={Money} alt="Money" /> },
    { id: 'hospitals', label: 'Hospitals and Clinics', icon: <img src={Hospital} alt="Hospital" /> },
    { id: 'subsidies-govt', label: 'Subsidies and Govt Support', icon: <img src={Govt} alt="Govt" /> }
  ];

  const handleTopicToggle = (topicLabel) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicLabel)) {
        // If already selected, remove it
        return prev.filter(label => label !== topicLabel);
      } else if (prev.length < 2) {
        // If less than 2 selected, add it
        return [...prev, topicLabel];
      }
      // If 2 are already selected and this isn't one of them, do nothing
      return prev;
    });
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    console.log('User preferences:', {
      language: selectedLanguage,
      textSize: selectedTextSize,
      contentMode: selectedContentMode,
      topics: selectedTopics
    });

    const preferences = {
      language: selectedLanguage,
      textSize: selectedTextSize,
      contentMode: selectedContentMode,
      topics: selectedTopics
    };

    try {
      const res = await fetch("http://localhost:5001/api/v1/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, ...preferences })
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
        alert(`Failed to save preferences: ${data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences. Network error.");
    }
  };

  return (
    <div className="preferences-container">
      <div className="signup-preferences-card">
        <div className="preferences-content">
          <div className="header-section">
            <h1 className="greeting">Hi {username}!</h1>
            <p className="subtitle">We want to get to know you better</p>
          </div>

          <div className="main-content">
            <div className="left-column">
              <div className="signup-preference-group">
                <label className="signup-preference-label">Preferred Language</label>
                <div className="language-options">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      className={`language-btn ${selectedLanguage === lang.id ? 'selected' : ''}`}
                      onClick={() => setSelectedLanguage(lang.id)}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="signup-preference-group">
                <label className="signup-preference-label">Text Size</label>
                <div className="text-size-options">
                  {textSizes.map((size) => (
                    <button
                      key={size.id}
                      className={`text-size-btn ${selectedTextSize === size.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTextSize(size.id)}
                      style={{ fontSize: size.fontSize }}>
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="signup-preference-group">
                <label className="signup-preference-label">Content Mode</label>
                <div className="content-mode-options">
                  {contentModes.map((mode) => (
                    <div
                      key={mode.id}
                      className={`content-mode-card ${selectedContentMode === mode.id ? 'selected' : ''}`}
                      onClick={() => setSelectedContentMode(mode.id)}
                    >
                      <div className="mode-preview">
                        <div className="preview-image"></div>
                        {mode.id === 'Easy Read' && (
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
                <label className="signup-preference-label">Topics Interested In</label>

                <div className="topics-header">
                  <span>For Care Recipient</span>
                  <span>For Caregiver</span>
                </div>

                <div className="topics-grid">
                  <div className="topics-column">
                    {careRecipientTopics.map((topic) => {
                      const isSelected = selectedTopics.includes(topic.label);
                      const isDisabled = !isSelected && selectedTopics.length >= 2;
                      return (
                        <button
                          key={topic.id}
                          className={`topic-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                          onClick={() => handleTopicToggle(topic.label)}>
                          <span className="topic-icon">{topic.icon}</span>
                          <span className="topic-text">{topic.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="topics-column">
                    {caregiverTopics.map((topic) => {
                      const isSelected = selectedTopics.includes(topic.label);
                      const isDisabled = !isSelected && selectedTopics.length >= 2;
                      
                      return (
                        <button
                          key={topic.id}
                          className={`topic-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                          onClick={() => handleTopicToggle(topic.label)}
                          disabled={isDisabled}>
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
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;