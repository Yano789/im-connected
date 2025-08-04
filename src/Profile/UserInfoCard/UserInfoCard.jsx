import React from 'react';
import './UserInfoCard.css';

function UserInfoCard({ user, isEditing, onChange, onSave, onEditClick, errors }) {
    
    // --- FOR EDIT MODE ---
    if (isEditing) {
        return (
            <div className="user-card">
                <div className="user-details">
                    <div className="detail-row edit-mode">
                        <label htmlFor="name" className="detail-label">Name:</label>
                        <input type="text" id="name" name="name" value={user.name || ''} onChange={onChange} />
                        {errors.name && <p className="error-text">{errors.name}</p>}
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="username" className="detail-label">Username:</label>
                        <input type="text" id="username" name="username" value={user.username || ''} onChange={onChange} />
                        {errors.username && <p className="error-text">{errors.username}</p>}
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="email" className="detail-label">Email Address:</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={user.email || ''} 
                            onChange={onChange} 
                            required 
                        />
                        {errors.email && <p className="error-text">{errors.email}</p>}                    
                    </div>
                    <div className="detail-row edit-mode">
                        <label htmlFor="number" className="detail-label">Phone Number:</label>
                        <input 
                            type="tel" 
                            id="number" 
                            name="number" 
                            value={user.number || ''} 
                            onChange={onChange}
                        />
                        {errors.number && <p className="error-text">{errors.number}</p>}
                    </div>
                </div>
                <button onClick={onSave} className="save-profile-button">Save Changes</button>
            </div>
        );
    }

    // --- FOR VIEW MODE ---
    return (
        <div className="user-card">
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
                        <span className="detail-value">{user.number}</span>
                    </div>
                     <button onClick={onEditClick} className="edit-icon-button">✏️</button>
                </div>
            </div>
        </div>
    );
}

export default UserInfoCard;