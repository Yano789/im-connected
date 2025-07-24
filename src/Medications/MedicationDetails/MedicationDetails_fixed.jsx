import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MedicationDetails.css';

const AnimateContent = ({ children, contentKey }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    </AnimatePresence>
);

function MedicationDetails({ medication, onEdit }) {
    if (!medication) {
        return (
            <div className="details-card">
                <div className="placeholder"><p>Select a medication to see its details.</p></div>
            </div>
        );
    }
    
    const activePeriods = new Set(medication.dosages?.map(d => d.period) || []);

    const iconTransition = { type: "spring", stiffness: 400, damping: 25 };
    const activeStyle = { backgroundColor: '#fde2e4', borderColor: '#e56b6f', scale: 1 };
    const inactiveStyle = { backgroundColor: 'rgba(255, 255, 255, 0)', borderColor: 'rgba(229, 107, 111, 0)', scale: 0.95 };

    return (
        <div className="details-card">
            <AnimateContent contentKey={medication.name}>
                <h2 className="medication-title">{medication.name}</h2>
            </AnimateContent>

            <div className="detail-section">
                <h3 className="section-header">Schedule</h3>
                {medication.schedule ? (
                    <AnimateContent contentKey={medication.schedule}>
                        <p className="section-content">{medication.schedule}</p>
                    </AnimateContent>
                ) : (
                    <div className="schedule-icons">
                        <motion.div
                            className={`icon-item ${activePeriods.has('Morning') ? 'active' : ''}`}
                            animate={activePeriods.has('Morning') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Morning">☀️</span>Morning
                        </motion.div>
                        <motion.div
                            className={`icon-item ${activePeriods.has('Afternoon') ? 'active' : ''}`}
                            animate={activePeriods.has('Afternoon') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Afternoon">☀️</span>Afternoon
                        </motion.div>
                        <motion.div
                            className={`icon-item ${activePeriods.has('Evening') ? 'active' : ''}`}
                            animate={activePeriods.has('Evening') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Evening">🌙</span>Evening
                        </motion.div>
                        <motion.div
                            className={`icon-item ${activePeriods.has('Night') ? 'active' : ''}`}
                            animate={activePeriods.has('Night') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Night">🌙</span>Night
                        </motion.div>
                    </div>
                )}
            </div>

            {medication.dosage && (
                <div className="detail-section">
                    <h3 className="section-header">Dosage</h3>
                    <AnimateContent contentKey={medication.dosage}>
                        <p className="section-content">{medication.dosage}</p>
                    </AnimateContent>
                </div>
            )}

            <div className="detail-section">
                <h3 className="section-header">Used to treat</h3>
                <AnimateContent contentKey={medication.usedTo}>
                    <p className="section-content">{medication.usedTo}</p>
                </AnimateContent>
            </div>

            <div className="detail-section">
                <h3 className="section-header">Side effects</h3>
                <AnimateContent contentKey={medication.sideEffects}>
                    <p className="section-content">{medication.sideEffects}</p>
                </AnimateContent>
            </div>

            {medication.warnings && (
                <div className="detail-section">
                    <h3 className="section-header">Warnings & Precautions</h3>
                    <AnimateContent contentKey={medication.warnings}>
                        <p className="section-content">{medication.warnings}</p>
                    </AnimateContent>
                </div>
            )}
            
            <div className="detail-section">
                <h3 className="section-header">Image</h3>
                <AnimateContent contentKey={medication.image}>
                    <img src={medication.image} alt={medication.name} className="medication-image" />
                </AnimateContent>
            </div>

            <button className="edit-button" onClick={onEdit}>Edit medicine</button>
        </div>
    );
}

export default MedicationDetails;
