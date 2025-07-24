import React, { useState, useEffect, useRef } from 'react';
import './MedicationForm.css';
import medicationScannerService from '../../services/medicationScannerService';
import medicationCloudinaryService from '../../services/medicationCloudinaryService';

const getPeriodFromTime = (time) => {
    if (!time) return 'Morning';
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
};

function MedicationForm({ medication, onSave, onCancel, onDelete, capturedFile = null, selectedRecipient = null }) {
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
            setScanError('Error processing captured file');
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
                setScanError('Please select a valid image file (JPEG, PNG, WebP) under 10MB');
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
            setScanError('Please select an image file first');
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
                throw new Error('Scanner service is not available. Please ensure the scanner server is running on port 3001.');
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
                    image: medicationData.image || prevData.image,
                }));

                setScanSuccess(`Medication "${medicationData.name}" scanned successfully! Confidence: ${Math.round(medicationData.confidence * 100)}% - Form auto-filled. Click "Save Medicine" to store permanently.`);
                
                // Show additional info if available
                if (medicationData.brandNames && medicationData.brandNames.length > 0) {
                    setScanSuccess(prev => prev + ` | Brand names: ${medicationData.brandNames.join(', ')}`);
                }
            } else {
                setScanError('No medication information could be extracted from the image. The image may be unclear or not contain medication text. Please try a clearer image or enter information manually.');
                console.log('No valid medication data extracted. Scan result:', scanResult);
            }
        } catch (error) {
            console.error('Scanning error:', error);
            setScanError(`Scanning failed: ${error.message}`);
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
            const newImageUrl = URL.createObjectURL(e.target.files[0]);
            setFormData(prev => ({ ...prev, image: newImageUrl }));
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
        if (selectedFile && !formData.image) {
            setIsUploading(true);
            setUploadError('');
            setUploadSuccess('');
            
            try {
                console.log('Uploading medication image to Cloudinary...');
                const uploadResult = await medicationCloudinaryService.uploadMedicationImage(selectedFile);
                
                if (uploadResult && uploadResult.url) {
                    finalFormData.image = uploadResult.url;
                    finalFormData.imagePublicId = uploadResult.public_id; // Store for potential deletion
                    setUploadSuccess('Image uploaded successfully to cloud storage!');
                    console.log('Image uploaded successfully:', uploadResult.url);
                } else {
                    throw new Error('Failed to upload image - no URL returned');
                }
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                setUploadError(`Failed to upload image: ${error.message}`);
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
                <h2 className="medication-title">{isEditing ? 'Edit Medication' : 'Add New Medication'}</h2>
                {isEditing && (
                    <button 
                        type="button" 
                        onClick={onDelete} 
                        className="delete-button-top-right" 
                        title="Delete Medication"
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Medication Scanner Section */}
            <div className="scanner-section">
                <h3>📷 Scan Medication</h3>
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
                            <img src={previewUrl} alt="Selected medication" className="preview-image" />
                            <button type="button" onClick={clearFile} className="clear-file-btn">❌ Remove</button>
                        </div>
                    )}
                    <div className="scanner-actions">
                        <button 
                            type="button" 
                            onClick={handleScanMedication}
                            disabled={!selectedFile || isScanning}
                            className="scan-button"
                        >
                            {isScanning ? '🔄 Scanning...' : 
                             selectedRecipient ? '🔍 Scan & Save to Database' : '🔍 Scan Medication (Preview)'}
                        </button>
                    </div>
                </div>
                
                {/* Scanner feedback */}
                {scanError && <div className="scan-error">⚠️ {scanError}</div>}
                {scanSuccess && <div className="scan-success">✅ {scanSuccess}</div>}
                {uploadError && <div className="scan-error">⚠️ Upload Error: {uploadError}</div>}
                {uploadSuccess && <div className="scan-success">✅ {uploadSuccess}</div>}
                {isScanning && <div className="scan-progress">Processing image and extracting medication information...</div>}
                
                <div className="scanner-divider">
                    <span>OR</span>
                </div>
            </div>

            {/* Manual Entry Section */}
            <div className="manual-entry-section">
                <h3>✏️ Manual Entry</h3>
                
                <div className="form-group">
                    <label htmlFor="name">Medication Name *</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        required
                        placeholder="Enter medication name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dosage">Dosage</label>
                    <input 
                        type="text" 
                        id="dosage" 
                        name="dosage" 
                        value={formData.dosage} 
                        onChange={handleChange}
                        placeholder="e.g., 500mg, 2 tablets"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="schedule">Schedule</label>
                    <input 
                        type="text" 
                        id="schedule" 
                        name="schedule" 
                        value={formData.schedule} 
                        onChange={handleChange}
                        placeholder="e.g., Once daily, Every 8 hours"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="usedTo">Used to treat</label>
                    <textarea 
                        id="usedTo" 
                        name="usedTo" 
                        value={formData.usedTo} 
                        onChange={handleChange}
                        placeholder="What this medication is used for"
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sideEffects">Side Effects</label>
                    <textarea 
                        id="sideEffects" 
                        name="sideEffects" 
                        value={formData.sideEffects} 
                        onChange={handleChange}
                        placeholder="Potential side effects"
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="warnings">Warnings & Precautions</label>
                    <textarea 
                        id="warnings" 
                        name="warnings" 
                        value={formData.warnings} 
                        onChange={handleChange}
                        placeholder="Important warnings and precautions"
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label>Image</label>
                    <div className="image-preview-container">
                        {formData.image && <img src={formData.image} alt="Medication Preview" className="image-preview" />}
                    </div>
                    <label htmlFor="image-upload" className="upload-image-button">
                        {isEditing ? 'Upload New Image' : 'Upload Image'}
                    </label>
                    <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>

                <div className="form-group">
                    <label>Dosage Times</label>
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
                                    className="remove-dosage-button">Remove</button>
                            </div>
                    ))}
                    <button type="button" onClick={handleAddDosage} className="add-dosage-button">+ Add Dosage</button>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
                <button type="submit" className="save-button" disabled={isScanning || isUploading}>
                    {isUploading ? 'Uploading Image...' : isScanning ? 'Processing...' : 'Save Medicine'}
                </button>
            </div>
        </form>
    );
}

export default MedicationForm;