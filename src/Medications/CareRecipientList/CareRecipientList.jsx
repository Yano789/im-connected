import React from 'react';
import './CareRecipientList.css';

// This component receives data from its parent through "props"
function CareRecipientList({ recipients, onSelect, selectedRecipientId }) {
    return (
        <div className="card">
            <h2 className="card-header">My Care Recipients</h2>
            <div className="recipient-list">
                {recipients.map((recipient) => {
                    // Check if the current recipient is the selected one
                    const isSelected = recipient.id === selectedRecipientId;
                    return (
                        <div 
                            key={recipient.id} 
                            // Apply a 'selected' class for styling if it's the active one
                            className={isSelected ? 'recipient-item selected' : 'recipient-item'}
                            // When clicked, call the onSelect function from the parent
                            onClick={() => onSelect(recipient)}
                        >
                            <span>{recipient.name}</span>
                            <button className={isSelected ? 'show-button' : 'switch-button'}>
                                {isSelected ? 'Showing' : 'Switch'}
                            </button>
                        </div>
                    );
                })}
            </div>
            <button className="add-recipient-button">Add Care Recipient</button>
        </div>
    );
}

export default CareRecipientList;