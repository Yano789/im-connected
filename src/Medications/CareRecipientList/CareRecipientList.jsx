import React from 'react';
import './CareRecipientList.css';
import { useTranslation } from 'react-i18next';

function CareRecipientList({ recipients, onSelect, selectedRecipientId, onDelete, isAdding, onAdd, onSaveNew, newName, setNewName  }) {
    const { t } = useTranslation();
    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSaveNew();
        }
    };
    
    return (
        <div className="card">
            <h2 className="card-header">{t("My Care Recipients")}</h2>
            <div className="recipient-list">
                {recipients.map((recipient, index) => {
                    const isSelected = recipient.id === selectedRecipientId && !isAdding;
                    const isLastItem = index === recipients.length - 1;
                    return (
                        <div 
                            key={recipient.id} 
                            className={`recipient-item ${isSelected ? 'selected' : ''} ${isLastItem ? 'last-item' : ''}`}
                            onClick={() => onSelect(recipient.id)}
                        >
                            <span>{recipient.name}</span>
                            <div className="recipient-buttons">
                                <button className={isSelected ? 'show-button' : 'switch-button'}>
                                    {isSelected ? t('Showing') : t('Switch')}
                                </button>
                                {onDelete && (
                                    <button 
                                        className="delete-recipient-button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent selecting the recipient
                                            onDelete(recipient.id);
                                        }}
                                        title={t("Delete care recipient")}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {isAdding && (
                    <div className="add-recipient-inline-form">
                        <div className="animated-line"></div>
                        <input
                            type="text"
                            autoFocus
                            placeholder={t("New Recipient's Name...")}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button onClick={onSaveNew} className="save-new-button">{t("Save")}</button>
                    </div>
                )}
            </div>
            
            {!isAdding && (
                <button className="add-recipient-button" onClick={onAdd}>
                    {t("Add Care Recipient")}
                </button>
            )}       
        </div>
    );
}

export default CareRecipientList;