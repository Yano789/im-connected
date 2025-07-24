import React, { useState } from 'react';
import Header from "../../TopHeader/Header/Header";
import './ProfilePage.css';
import UserInfoCard from '../UserInfoCard/UserInfoCard';
import PreferencesCard from '../PreferencesCard/PreferencesCard';

// Dummy Data for the profile page
const initialUserData = {
    name: 'Kenny Lu',
    username: 'kenny_lu',
    email: 'abc@gmail.com',
    phone: '1234 5678',
    password: '', 
    confirmPassword: '', 
    avatar: 'https://i.imgur.com/8m2bAOr.jpeg', // Placeholder
    preferences: {
        language: 'English',
        textSize: 'Medium',
        contentMode: 'Default Mode'
    }
};

function ProfilePage() {
    const [userData, setUserData] = useState(initialUserData);

    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [errors, setErrors] = useState({}); 


    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleProfileSave = () => {
        const newErrors = {};
        // Regular expressions to test the formats
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[0-9\s]+$/;

        // --- NEW: Email Validation ---
        if (!emailRegex.test(userData.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        // --- NEW: Phone Validation ---
        if (!phoneRegex.test(userData.phone)) {
            newErrors.phone = "Phone number can only contain numbers and spaces.";
        }
        
        // Existing Password validation
        if (userData.password && userData.password !== userData.confirmPassword) {
            newErrors.password = "Passwords do not match.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors); // If there are any errors, show them
            return; // And stop the save process
        }

    // If no errors, clear old errors and save
    setErrors({});
    setIsEditingProfile(false);
    console.log("Profile Saved!", userData);
    // Connect to backend here?
};

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const newAvatarUrl = URL.createObjectURL(e.target.files[0]);
            setUserData(prevData => ({ ...prevData, avatar: newAvatarUrl }));
        }
    };

    const handlePreferenceChange = (category, value) => {
        setUserData(prevData => ({
            ...prevData,
            preferences: {
                ...prevData.preferences,
                [category]: value
            }
        }));
    };
    
    return (
        <>
            <Header />
            <div className="profile-page-container">
                <div className="profile-greeting">
                    <h1>
                        How are you <span className="profile-name">{userData.name.split(' ')[0]}</span>?
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
                        <PreferencesCard preferences={userData.preferences} onPreferenceChange={handlePreferenceChange} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;