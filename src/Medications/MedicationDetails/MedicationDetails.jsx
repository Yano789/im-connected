import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MedicationDetails.css';
import { useTranslation } from 'react-i18next';
import medicationTranslationService from '../services/medicationTranslationService';

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
    const { t, i18n } = useTranslation();
    const [translatedMedication, setTranslatedMedication] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);
    
    // Translate medication data when medication or language changes
    useEffect(() => {
        const translateMedicationData = async () => {
            if (!medication) {
                setTranslatedMedication(null);
                return;
            }
            
            setIsTranslating(true);
            try {
                const translated = await medicationTranslationService.translateMedication(medication);
                setTranslatedMedication(translated);
            } catch (error) {
                console.error('MedicationDetails: Failed to translate medication:', error);
                setTranslatedMedication(medication); // Fallback to original
            } finally {
                setIsTranslating(false);
            }
        };

        translateMedicationData();
    }, [medication, i18n.language]); // Re-translate when medication or language changes
    
    // Use translated medication or original medication
    const displayMedication = translatedMedication || medication;
    
    if (!medication) {
        return (
            <div className="details-card">
                <div className="placeholder"><p>{t("Select a medication to see its details.")}</p></div>
            </div>
        );
    }

    // Show loading state while translating
    if (isTranslating) {
        return (
            <div className="details-card">
                <div className="placeholder"><p>{t("Loading...")} 🌐</p></div>
            </div>
        );
    }
    
    const activePeriods = new Set(
        displayMedication.dosages
            ?.filter(dosage => dosage.taken)
            ?.map(dosage => dosage.period) || []
    );

    const iconTransition = { type: "spring", stiffness: 400, damping: 25 };
    const activeStyle = { backgroundColor: '#fde2e4', borderColor: '#e56b6f', scale: 1 };
    const inactiveStyle = { backgroundColor: 'rgba(255, 255, 255, 0)', borderColor: 'rgba(229, 107, 111, 0)', scale: 0.95 };

    return (
        <div className="details-card">
            <AnimateContent contentKey={displayMedication.name}>
                <h2 className="medication-title">{displayMedication.name}</h2>
            </AnimateContent>

            <div className="detail-section">
                <h3 className="section-header">{t("Schedule")}</h3>
                {displayMedication.schedule ? (
                    <AnimateContent contentKey={displayMedication.schedule}>
                        <p className="section-content">{displayMedication.schedule}</p>
                    </AnimateContent>
                ) : (
                    <div className="schedule-icons">
                        <motion.div
                            className={`icon-item ${activePeriods.has('Morning') ? 'active' : ''}`}
                            animate={activePeriods.has('Morning') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Morning">☀️</span>{t("Morning")}
                        </motion.div>
                        <motion.div
                            className={`icon-item ${activePeriods.has('Afternoon') ? 'active' : ''}`}
                            animate={activePeriods.has('Afternoon') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Afternoon">☀️</span>{t("Afternoon")}
                        </motion.div>
                        <motion.div
                            className={`icon-item ${activePeriods.has('Evening') ? 'active' : ''}`}
                            animate={activePeriods.has('Evening') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Evening">🌙</span>{t("Evening")}
                        </motion.div>
                        <motion.div
                            className={`icon-item ${activePeriods.has('Night') ? 'active' : ''}`}
                            animate={activePeriods.has('Night') ? activeStyle : inactiveStyle}
                            transition={iconTransition}
                        >
                            <span role="img" aria-label="Night">🌙</span>{t("Night")}
                        </motion.div>
                    </div>
                )}
            </div>

            {displayMedication.dosage && (
                <div className="detail-section">
                    <h3 className="section-header">{t("Dosage")}</h3>
                    <AnimateContent contentKey={displayMedication.dosage}>
                        <p className="section-content">{displayMedication.dosage}</p>
                    </AnimateContent>
                </div>
            )}

            <div className="detail-section">
                <h3 className="section-header">{t("Used For")}</h3>
                <AnimateContent contentKey={displayMedication.usedTo}>
                    <p className="section-content">{displayMedication.usedTo}</p>
                </AnimateContent>
            </div>

            <div className="detail-section">
                <h3 className="section-header">{t("Side Effects")}</h3>
                <AnimateContent contentKey={displayMedication.sideEffects}>
                    <p className="section-content">{displayMedication.sideEffects}</p>
                </AnimateContent>
            </div>

            {displayMedication.warnings && (
                <div className="detail-section">
                    <h3 className="section-header">{t("Warnings")}</h3>
                    <AnimateContent contentKey={displayMedication.warnings}>
                        <p className="section-content">{displayMedication.warnings}</p>
                    </AnimateContent>
                </div>
            )}
            
            <div className="detail-section">
                <h3 className="section-header">{t("Image")}</h3>
                <AnimateContent contentKey={displayMedication.image}>
                    {displayMedication.image ? (
                        <img src={displayMedication.image} alt={displayMedication.name} className="medication-image" />
                    ) : (
                        <div className="no-image-placeholder">
                            <p>{t("No image available")}</p>
                            <small>{t("Upload an image when editing this medication")}</small>
                        </div>
                    )}
                </AnimateContent>
            </div>

            <button className="edit-button" onClick={onEdit}>{t("Edit medicine")}</button>
        </div>
    );
}

export default MedicationDetails;
