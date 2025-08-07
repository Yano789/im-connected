import { useState, useEffect } from "react";
import Header from "../../TopHeader/Header/Header";
import "./ProfilePage.css";
import UserInfoCard from "../UserInfoCard/UserInfoCard";
import PreferencesCard from "../PreferencesCard/PreferencesCard";
import i18next from "i18next";
import { applyTextSize } from "../TextSize";
import { useTranslation } from "react-i18next";

function ProfilePage() {
	const {t} = useTranslation();

  const [userData, setUserData] = useState("");

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/v1/user/getUser",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
        } else {
          console.error("Failed to fetch user:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleProfileSave = async () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    
    if (!userData.name || !/^[a-zA-Z]*$/.test(userData.name)) {
      newErrors.name = "Name must contain only letters.";
    }
    
    if (!userData.username) {
      newErrors.username = "Username is required.";
    }
    
    if (!emailRegex.test(userData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!phoneRegex.test(userData.number)) {
      newErrors.number = "Phone number must be valid (e.g. +91234567).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/v1/user/userDetails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: userData.name,
            newUsername: userData.username,
            number: userData.number,
            email: userData.email,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        setErrors({});
        setIsEditingProfile(false);
        console.log("Profile updated successfully!");
      } else {
        const errorData = await response.text();
        setErrors({ general: errorData });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ general: "Failed to update profile. Please try again." });
    }
  };

  const handlePreferenceChange = async (category, value) => {
    const updatedPreferences = {
      ...userData.preferences,
      [category]: value,
    };

    setUserData((prevData) => ({
      ...prevData,
      preferences: updatedPreferences,
    }));

    if (category === "preferredLanguage") {
      i18next.changeLanguage(value);
    }

    if (category === "textSize") {
      applyTextSize(value);
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/v1/user/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: userData.username,
            language: updatedPreferences.preferredLanguage,
            textSize: updatedPreferences.textSize,
            contentMode: updatedPreferences.contentMode,
            topics: updatedPreferences.topics || [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); 
        console.error(
          "Failed to update preferences:",
          errorData.error || errorData
        );
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="profile-page-container">
        <div className="profile-greeting">
          {errors.general && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {errors.general}
            </div>
          )}
          <h1>
            {t("How are you")}{" "}
            <span className="profile-name">
              {userData?.name?.split(" ")[0] || "User"}
            </span>
          </h1>
          <p>{t("Manage your profile here")}</p>
        </div>
        <div className="profile-layout">
          <div className="profile-left-column">
            <UserInfoCard
              user={userData}
              isEditing={isEditingProfile}
              onChange={handleProfileChange}
              onSave={handleProfileSave}
              onEditClick={() => setIsEditingProfile(true)}
              errors={errors}
            />
          </div>
          <div className="profile-right-column">
            <PreferencesCard
              preferences={userData.preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
