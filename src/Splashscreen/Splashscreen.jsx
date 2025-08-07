import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import HeartLogo from "../assets/HeartLogo.png";
import SplashChars from "../assets/SplashscreenCharacters.png";
import AIChatUI from "../assets/AIChatUI.png";
import MedicationUI from "../assets/MedicationUI.png";
import ForumUI from "../assets/ForumUI.png";
import GlobeImg from "../assets/Globe.png";
import PillboxIcon from "../assets/PillboxIconSplashscreen.png";
import ChatbotIcon from "../assets/ChatbotIconSplashscreen.png";
import ForumIcon from "../assets/ForumIconSplashscreen.png";

import "./Splashscreen.css";

import { useTranslation } from "react-i18next";

const services = [
  {
    id: "medication",
    title: "Medication Logging",
    description:
      "Track daily medications and scan prescriptions for instructions",
    icon: PillboxIcon, 
    uiImage: MedicationUI,
    colorClass: "med-card-shadow",
  },
  {
    id: "aiChat",
    title: "AI Chat Companion",
    description:
      "Get emotional support, summaries, translations and resource info",
    icon: ChatbotIcon, 
    uiImage: AIChatUI,
    colorClass: "ai-card-shadow",
  },
  {
    id: "forum",
    title: "Caregiver Forum",
    description:
      "Join discussions and share your experiences with other caregivers",
    icon: ForumIcon,  
    uiImage: ForumUI,
    colorClass: "forum-card-shadow",
  },
];

export default function SplashScreen() {
  const [selectedService, setSelectedService] = useState(services[1]); 
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <div className="splash-screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="splash-header">
        {/* Left side */}
        <div className="header-left">
          <p className="sponsor-text">
            {t("A collaboration between SUTD & Lion Befrienders")}
          </p>
          <div className="logo-row">
            <h1 className="logo-text">
              <em>{t("im")}</em>
              <span className="logo-bold">{t("Connected")}</span>
              <img src={HeartLogo} alt="Heart logo" className="heart-logo" />
            </h1>
          </div>
          <p className="tagline">
            {t("A supportive platform for caregivers and care recipients")}
          </p>
        </div>

        {/* Right side */}
        <div className="header-right">
          <div className="header-buttons">
            {/* language switcher */}
            <button className="lang-button">
              <img src={GlobeImg} alt="Language" className="globe-icon" />
              {t("English")} <span className="chevron-down">▼</span>
            </button>

            {/* sign up / sign in */}
            <Link to="/signup">
              <button className="top-button signup-btn">{t("Sign Up")}</button>
            </Link>
            <Link to="/login">
              <button className="top-button signin-btn">{t("Log In")}</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Services section */}
      <section className="services-section">
        <h2 className="services-title">{t("Services we provide:")}</h2>
        <div className="services-grid">
          {/* left: service cards */}
          <div className="cards-grid">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`service-card ${svc.colorClass} ${
                  selectedService.id === svc.id ? "active" : ""
                }`}
                onClick={() => setSelectedService(svc)}
              >
                <h3>{svc.title}</h3>
                <p>{svc.description}</p>
                <img
                  src={svc.icon}
                  alt={`${svc.title} icon`}
                  className="service-icon"
                />
              </div>
            ))}
          </div>

          {/* right: selected UI screenshot */}
          <div className="service-display">
            <img
              src={selectedService.uiImage}
              alt={`${selectedService.title} UI`}
            />
          </div>
        </div>
      </section>
    </div>
);
}
