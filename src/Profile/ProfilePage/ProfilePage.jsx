import { useState, useEffect } from "react";
import Header from "../../TopHeader/Header/Header";
import "./ProfilePage.css";
import UserInfoCard from "../UserInfoCard/UserInfoCard";
import PreferencesCard from "../PreferencesCard/PreferencesCard";
import i18next from "i18next";
import { applyTextSize } from "../TextSize";

function ProfilePage() {
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

  const handleProfileSave = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9\s]+$/;
    if (!emailRegex.test(userData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!phoneRegex.test(userData.phone)) {
      newErrors.phone = "Phone number can only contain numbers and spaces.";
    }
    if (userData.password && userData.password !== userData.confirmPassword) {
      newErrors.password = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsEditingProfile(false);
    console.log("Profile Saved!", userData);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newAvatarUrl = URL.createObjectURL(e.target.files[0]);
      setUserData((prevData) => ({ ...prevData, avatar: newAvatarUrl }));
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
          <h1>
            How are you{" "}
            <span className="profile-name">
              {userData?.name?.split(" ")[0] || "User"}
            </span>
          </h1>
          <p>Manage your profile here</p>
        </div>
        <div className="profile-layout">
          <div className="profile-left-column">
            <UserInfoCard
              user={userData}
              isEditing={isEditingProfile}
              onChange={handleProfileChange}
              onSave={handleProfileSave}
              onEditClick={() => setIsEditingProfile(true)}
              onAvatarChange={handleAvatarChange}
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
