import React, { useState, useEffect, useRef } from 'react';
import './MedicationForm.css';
import medicationScannerService from '../services/medicationScannerService';
import medicationCloudinaryService from '../services/medicationCloudinaryService';
import { useTranslation } from 'react-i18next';

const getPeriodFromTime = (time) => {
    if (!time) return 'Morning';
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
};

function MedicationForm({ medication, onSave, onCancel, onDelete, capturedFile = null, selectedRecipient = null }) {
    const { t } = useTranslation();
    // Determine if we are editing an existing medication or creating a new one
    const isEditing = medication !== null && medication !== undefined;

    const [formData, setFormData] = useState({
        name: '',
        usedTo: '',
        sideEffects: '',
        dosage: '',
        schedule: '',
        warnings: '',
        dosages: [{ time: '', taken: false }],
        image: '',
    });

    // Scanner-related state
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const [scanSuccess, setScanSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    
    // Image upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    const fileInputRef = useRef(null);

    // Check for captured file from camera on component mount
    useEffect(() => {
        try {
            console.log('Effect triggered - capturedFile:', capturedFile, 'isEditing:', isEditing);
            if (capturedFile && !isEditing) {
                console.log('Setting captured file as selected file:', capturedFile);
                setSelectedFile(capturedFile);
                setPreviewUrl(URL.createObjectURL(capturedFile));
                console.log('Selected file state updated');
            }
        } catch (error) {
            console.error('Error handling captured file:', error);
            setScanError(t('Error processing captured file'));
        }
    }, [capturedFile, isEditing]);

    useEffect(() => {
        try {
            const isEditing = medication !== null && medication !== undefined;
            console.log('Setting form data. isEditing:', isEditing, 'medication:', medication);
            
            setFormData({
                name: isEditing ? (medication?.name || '') : '',
                usedTo: isEditing ? (medication?.usedTo || '') : '',
                sideEffects: isEditing ? (medication?.sideEffects || '') : '',
                dosage: isEditing ? (medication?.dosage || '') : '',
                schedule: isEditing ? (medication?.schedule || '') : '',
                warnings: isEditing ? (medication?.warnings || '') : '',
                dosages: isEditing ? JSON.parse(JSON.stringify(medication?.dosages || [])) : [{ time: '', taken: false }],
                image: isEditing ? (medication?.image || '') : '' 
            });
        } catch (error) {
            console.error('Error setting form data:', error);
            // Set default form data if there's an error
            setFormData({
                name: '',
                usedTo: '',
                sideEffects: '',
                dosage: '',
                schedule: '',
                warnings: '',
                dosages: [{ time: '', taken: false }],
                image: ''
            });
        }
    }, [medication]);
    // A function to handle changes in any input field
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // Handle file selection for scanning
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (medicationScannerService.validateImageFile(file)) {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setScanError('');
            } else {
                setScanError(t('Please select a valid image file (JPEG, PNG, WebP) under 10MB'));
            }
        }
    };

    // Handle medication scanning - PREVIEW ONLY, no database saving
    const handleScanMedication = async (event) => {
        // Prevent default button behavior
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        
        console.log('handleScanMedication called with event:', event);
        console.log('Current selectedFile state:', selectedFile);
        
        const targetFile = selectedFile;
        
        if (!targetFile) {
            console.log('No file selected - selectedFile is:', selectedFile);
            setScanError(t('Please select an image file first'));
            return;
        }

        console.log('Starting medication scan with file:', {
            name: targetFile.name,
            type: targetFile.type,
            size: targetFile.size,
            lastModified: targetFile.lastModified
        });
        
        setIsScanning(true);
        setScanError('');
        setScanSuccess('');

        try {
            // Check if scanner API is available
            console.log('Checking scanner API health...');
            const isApiAvailable = await medicationScannerService.checkApiHealth();
            if (!isApiAvailable) {
                throw new Error(t('Scanner service is not available. Please ensure the scanner server is running on port 3001.'));
            }

            console.log('Scanner API is available, proceeding with scan...');

            // Always perform preview scan only - do not save to database from scan button
            console.log('Performing preview scan only...');
            
            const scanResult = await medicationScannerService.scanMedicationImage(targetFile);
            console.log('Scan result received:', scanResult);
            
            const medicationData = medicationScannerService.formatMedicationData(scanResult);
            console.log('Formatted medication data:', medicationData);

            if (medicationData && medicationData.name) {
                // Update form data with scanned information (auto-fill)
                setFormData(prevData => ({
                    ...prevData,
                    name: medicationData.name || prevData.name,
                    usedTo: medicationData.usedFor || prevData.usedTo,
                    sideEffects: medicationData.sideEffects || prevData.sideEffects,
                    dosage: medicationData.dosage || prevData.dosage,
                    schedule: medicationData.schedule || prevData.schedule,
                    warnings: medicationData.warnings || prevData.warnings,
                    // Don't set image from scan result - it will be set during save
                    // image: medicationData.image || prevData.image,
                }));

                setScanSuccess(t('Medication "{{name}}" scanned successfully! Confidence: {{confidence}}% - Form auto-filled. Click "Save Medicine" to store permanently.', {
                    name: medicationData.name,
                    confidence: Math.round(medicationData.confidence * 100)
                }));
                
                // Show additional info if available
                if (medicationData.brandNames && medicationData.brandNames.length > 0) {
                    setScanSuccess(prev => prev + t(' | Brand names: {{brands}}', {
                        brands: medicationData.brandNames.join(', ')
                    }));
                }
            } else {
                setScanError(t('No medication information could be extracted from the image. The image may be unclear or not contain medication text. Please try a clearer image or enter information manually.'));
                console.log('No valid medication data extracted. Scan result:', scanResult);
            }
        } catch (error) {
            console.error('Scanning error:', error);
            setScanError(t('Scanning failed: {{message}}', { message: error.message }));
        } finally {
            setIsScanning(false);
        }
    };

    // Clear selected file and preview
    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setScanError('');
        setScanSuccess('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Set the selected file for upload
            setSelectedFile(file);
            // Create preview URL but don't set it as the permanent image
            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);
            // Don't set formData.image to blob URL - it will be set to Cloudinary URL after upload
        }
    };

    const handleDosageChange = (index, field, value) => {
        const newDosages = [...formData.dosages];
        newDosages[index][field] = value;
        if (field === 'time') {
            newDosages[index].period = getPeriodFromTime(value);
        }
        setFormData(prev => ({ ...prev, dosages: newDosages }));
    };

    const handleAddDosage = () => {
        setFormData(prev => ({
            ...prev,
            dosages: [...prev.dosages, { period: 'Morning', time: '09:00', taken: false }]
        }));
    };

    const handleRemoveDosage = (index) => {
        const newDosages = formData.dosages.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, dosages: newDosages }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let finalFormData = { ...formData };
        
        // If there's a selected file (captured or uploaded), upload it first
        // Check for selectedFile OR if formData.image is a blob URL that needs to be replaced
        const needsImageUpload = selectedFile || (formData.image && formData.image.startsWith('blob:'));
        
        if (needsImageUpload && selectedFile) {
            setIsUploading(true);
            setUploadError('');
            setUploadSuccess('');
            
            try {
                console.log('Uploading medication image to Cloudinary...');
                const uploadResult = await medicationCloudinaryService.uploadMedicationImage(selectedFile);
                
                if (uploadResult && uploadResult.url) {
                    finalFormData.image = uploadResult.url;
                    finalFormData.imagePublicId = uploadResult.public_id; // Store for potential deletion
                    setUploadSuccess(t('Image uploaded successfully to cloud storage!'));
                    console.log('Image uploaded successfully:', uploadResult.url);
                } else {
                    throw new Error(t('Failed to upload image - no URL returned'));
                }
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                setUploadError(t('Failed to upload image: {{message}}', { message: error.message }));
                setIsUploading(false);
                return; // Don't save if image upload fails
            }
            
            setIsUploading(false);
        }
        
        // Save the medication data with the uploaded image URL
        onSave(finalFormData);
    };

    return (
        <form className="details-card form-card" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2 className="medication-title">{isEditing ? t('Edit Medication') : t('Add New Medication')}</h2>
                {isEditing && (
                    <button 
                        type="button" 
                        onClick={onDelete} 
                        className="delete-button-top-right" 
                        title={t("Delete Medication")}
                    >
                        {t("Delete")}
                    </button>
                )}
            </div>

            {/* Medication Scanner Section */}
            <div className="scanner-section">
                <h3>📷 {t("Scan Medication")}</h3>
                <div className="scanner-controls">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="file-input"
                    />
                    {selectedFile && (
                        <div className="file-preview">
                            <img src={previewUrl} alt={t("Selected medication")} className="preview-image" />
                            <button type="button" onClick={clearFile} className="clear-file-btn">❌ {t("Remove")}</button>
                        </div>
                    )}
                    <div className="scanner-actions">
                        <button 
                            type="button" 
                            onClick={handleScanMedication}
                            disabled={!selectedFile || isScanning}
                            className="scan-button"
                        >
                            {isScanning ? t('Scanning...') : 
                             selectedRecipient ? t(' Scan & Save to Database') : t(' Scan Medication (Preview)')}
                        </button>
                    </div>
                </div>
                
                {/* Scanner feedback */}
                {scanError && <div className="scan-error"> {scanError}</div>}
                {scanSuccess && <div className="scan-success"> {scanSuccess}</div>}
                {uploadError && <div className="scan-error"> {t("Upload Error")}: {uploadError}</div>}
                {uploadSuccess && <div className="scan-success"> {uploadSuccess}</div>}
                {isScanning && <div className="scan-progress">{t("Processing image and extracting medication information...")}</div>}
                
                <div className="scanner-divider">
                    <span>{t("OR")}</span>
                </div>
            </div>

            {/* Manual Entry Section */}
            <div className="manual-entry-section">
                <h3> {t("Manual Entry")}</h3>
                
                <div className="form-group">
                    <label htmlFor="name">{t("Medication Name")} *</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        required
                        placeholder={t("Enter medication name")}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dosage">{t("Dosage")}</label>
                    <input 
                        type="text" 
                        id="dosage" 
                        name="dosage" 
                        value={formData.dosage} 
                        onChange={handleChange}
                        placeholder={t("e.g., 500mg, 2 tablets")}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="schedule">{t("Schedule")}</label>
                    <input 
                        type="text" 
                        id="schedule" 
                        name="schedule" 
                        value={formData.schedule} 
                        onChange={handleChange}
                        placeholder={t("e.g., Once daily, Every 8 hours")}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="usedTo">{t("Used to treat")}</label>
                    <textarea 
                        id="usedTo" 
                        name="usedTo" 
                        value={formData.usedTo} 
                        onChange={handleChange}
                        placeholder={t("What this medication is used for")}
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sideEffects">{t("Side Effects")}</label>
                    <textarea 
                        id="sideEffects" 
                        name="sideEffects" 
                        value={formData.sideEffects} 
                        onChange={handleChange}
                        placeholder={t("Potential side effects")}
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="warnings">{t("Warnings & Precautions")}</label>
                    <textarea 
                        id="warnings" 
                        name="warnings" 
                        value={formData.warnings} 
                        onChange={handleChange}
                        placeholder={t("Important warnings and precautions")}
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label>{t("Image")}</label>
                    <div className="image-preview-container">
                        {(previewUrl || formData.image) && (
                            <img 
                                src={previewUrl || formData.image} 
                                alt={t("Medication Preview")} 
                                className="image-preview" 
                            />
                        )}
                    </div>
                    <label htmlFor="image-upload" className="upload-image-button">
                        {isEditing ? t('Upload New Image') : t('Upload Image')}
                    </label>
                    <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>

                <div className="form-group">
                    <label>{t("Dosage Times")}</label>
                    {formData.dosages.map((dosage, index) => (
                        <div key={index} className="dosage-input-row">
                            <input
                                type="time"
                                value={dosage.time}
                                onChange={(e) => handleDosageChange(index, 'time', e.target.value)}
                            />
                            <button 
                                    type="button" 
                                    onClick={() => handleRemoveDosage(index)} 
                                    className="remove-dosage-button">{t("Remove")}</button>
                            </div>
                    ))}
                    <button type="button" onClick={handleAddDosage} className="add-dosage-button">+ {t("Add Dosage")}</button>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-button">{t("Cancel")}</button>
                <button type="submit" className="save-button" disabled={isScanning || isUploading}>
                    {isUploading ? t('Uploading Image...') : isScanning ? t('Processing...') : t('Save Medicine')}
                </button>
            </div>
        </form>
    );
}

export default MedicationForm;