import React from 'react';
import './PreferencesCard.css';

function PreferencesCard({ preferences, onPreferenceChange }) {
    return (
        <div className="preferences-card">
            {/* --- Preferred Language Section --- */}
            <div className="preference-group">
                <h3 className="preference-label">Preferred Language</h3>
                <div className="preference-options">
                    <button onClick={() => onPreferenceChange('language', 'English')} className={preferences.language === 'English' ? 'pref-button selected' : 'pref-button'}>English</button>
                    <button onClick={() => onPreferenceChange('language', '中文')} className={preferences.language === '中文' ? 'pref-button selected' : 'pref-button'}>中文</button>
                    <button onClick={() => onPreferenceChange('language', 'Bahasa Melayu')} className={preferences.language === 'Bahasa Melayu' ? 'pref-button selected' : 'pref-button'}>Bahasa Melayu</button>
                    <button onClick={() => onPreferenceChange('language', 'தமிழ்')} className={preferences.language === 'தமிழ்' ? 'pref-button selected' : 'pref-button'}>தமிழ்</button>                </div>
            </div>

            {/* --- Text Size Section --- */}
            <div className="preference-group">
                <h3 className="preference-label">Text Size</h3>
                <div className="preference-options">
                    <button onClick={() => onPreferenceChange('textSize', 'Small')} className={preferences.textSize === 'Small' ? 'pref-button selected' : 'pref-button'}>Small</button>
                    <button onClick={() => onPreferenceChange('textSize', 'Medium')} className={preferences.textSize === 'Medium' ? 'pref-button selected' : 'pref-button'}>Medium</button>
                    <button onClick={() => onPreferenceChange('textSize', 'Big')} className={preferences.textSize === 'Big' ? 'pref-button selected' : 'pref-button'}>Big</button>
                </div>
            </div>

            {/* --- Content Mode Section --- */}
            <div className="preference-group">
                <h3 className="preference-label">Content Mode</h3>
                <div className="preference-options content-modes">
                    <button onClick={() => onPreferenceChange('contentMode', 'Easy Reader Mode')} className={preferences.contentMode === 'Easy Reader Mode' ? 'pref-button content-button selected' : 'pref-button content-button'}>
                        Easy Reader Mode
                    </button>
                    <button onClick={() => onPreferenceChange('contentMode', 'Default Mode')} className={preferences.contentMode === 'Default Mode' ? 'pref-button content-button selected' : 'pref-button content-button'}>
                        Default Mode
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PreferencesCard;