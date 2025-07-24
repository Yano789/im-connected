import React from 'react';
import './UserInfoCard.css';

function UserInfoCard({ user, isEditing, onChange, onSave, onEditClick, onAvatarChange, errors   }) {
    
    // --- FOR EDIT MODE ---
    if (isEditing) {
        return (
            <div className="user-card">
                <div className="user-avatar-container">
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                    <label htmlFor="avatar-upload" className="avatar-upload-button">
                        Change Picture
                    </label>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={onAvatarChange}
                        style={{ display: 'none' }}
                    />
                </div>
                <div className="user-details">
                    <div className="detail-row edit-mode">
                        <label htmlFor="name" className="detail-label">Name:</label>
                        <input type="text" id="name" name="name" value={user.name} onChange={onChange} />
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="username" className="detail-label">Username:</label>
                        <input type="text" id="username" name="username" value={user.username} onChange={onChange} />
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="password">New Password:</label>
                        <input type="password" id="password" name="password" value={user.password} onChange={onChange} />
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={user.confirmPassword} onChange={onChange} />
                        {/* Show an error message if passwords don't match */}
                        {errors.password && <p className="error-text">{errors.password}</p>}
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="email" className="detail-label">Email Address:</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={user.email} 
                            onChange={onChange} 
                            required 
                        />
                        {errors.email && <p className="error-text">{errors.email}</p>}                    
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="phone" className="detail-label">Phone Number:</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            value={user.phone} 
                            onChange={onChange}
                            pattern="[0-9\s]+" 
                        />
                        {errors.phone && <p className="error-text">{errors.phone}</p>}
                    </div>
                </div>
                <button onClick={onSave} className="save-profile-button">Save Changes</button>
            </div>
        );
    }

    // --- FOR VIEW MODE ---
    return (
        <div className="user-card">
            <div className="user-avatar-container">
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <button onClick={onEditClick} className="avatar-edit-button" title="Edit Profile">✏️</button>
            </div>
            <div className="user-details">
                <div className="detail-row">
                    <div>
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{user.name}</span>
                    </div>
                    <button onClick={onEditClick} className="edit-icon-button">✏️</button>
                </div>
                <div className="detail-row">
                    <div>
                        <span className="detail-label">Username:</span>
                        <span className="detail-value">{user.username}</span>
                    </div>
                     <button onClick={onEditClick} className="edit-icon-button">✏️</button>
                </div>
                <div className="detail-row">
                    <div>
                        <span className="detail-label">Email Address:</span>
                        <span className="detail-value">{user.email}</span>
                    </div>
                     <button onClick={onEditClick} className="edit-icon-button">✏️</button>
                </div>
                <div className="detail-row">
                    <div>
                        <span className="detail-label">Phone Number:</span>
                        <span className="detail-value">{user.phone}</span>
                    </div>
                     <button onClick={onEditClick} className="edit-icon-button">✏️</button>
                </div>
            </div>
        </div>
    );
}

export default UserInfoCard;