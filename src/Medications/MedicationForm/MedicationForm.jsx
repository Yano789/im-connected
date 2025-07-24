import React, { useState, useRef } from 'react';
import './MedicationForm.css';
import medicationScannerService from '../../services/medicationScannerService';

function MedicationForm({ medication, onSave, onCancel, capturedFile = null }) {
    // Determine if we are editing an existing medication or creating a new one
    const isEditing = medication !== null;

    // Set up state to hold the form's data
    const [formData, setFormData] = useState({
        name: isEditing ? medication.name : '',
        usedTo: isEditing ? medication.usedTo : '',
        sideEffects: isEditing ? medication.sideEffects : '',
        dosage: isEditing ? medication.dosage : '',
        schedule: isEditing ? medication.schedule : '',
        warnings: isEditing ? medication.warnings : '',
        image: isEditing ? medication.image : '',
    });

        // Scanner-related state
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const [scanSuccess, setScanSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(capturedFile);
    const [previewUrl, setPreviewUrl] = useState(capturedFile ? URL.createObjectURL(capturedFile) : '');

    // Check for captured file from camera on component mount
    React.useEffect(() => {
        if (capturedFile && !isEditing) {
            console.log('Captured file received:', capturedFile);
            setSelectedFile(capturedFile);
            setPreviewUrl(URL.createObjectURL(capturedFile));
            
            // Auto-scan the captured image
            setTimeout(() => {
                handleScanMedication(capturedFile);
            }, 500);
        }
    }, [capturedFile]);

    const fileInputRef = useRef(null);

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

    // Handle medication scanning
    const handleScanMedication = async (fileToScan = null) => {
        const targetFile = fileToScan || selectedFile;
        
        if (!targetFile) {
            setScanError('Please select an image file first');
            return;
        }

        console.log('Starting medication scan with file:', targetFile);
        setIsScanning(true);
        setScanError('');
        setScanSuccess('');

        try {
            // Check if scanner API is available
            const isApiAvailable = await medicationScannerService.checkApiHealth();
            if (!isApiAvailable) {
                throw new Error('Scanner service is not available. Please ensure the scanner server is running on port 3001.');
            }

            console.log('Scanner API is available, proceeding with scan...');

            // Scan the medication image
            const scanResult = await medicationScannerService.scanMedicationImage(targetFile);
            console.log('Scan result received:', scanResult);
            
            const medicationData = medicationScannerService.formatMedicationData(scanResult);
            console.log('Formatted medication data:', medicationData);

            if (medicationData && medicationData.name) {
                // Update form data with scanned information
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

                setScanSuccess(`Medication "${medicationData.name}" scanned successfully! Confidence: ${Math.round(medicationData.confidence * 100)}%`);
                
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

    // A function to handle the form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from reloading
        onSave(formData); // Send the data back to the parent component
    };

    return (
        <form className="details-card form-card" onSubmit={handleSubmit}>
            <h2 className="medication-title">{isEditing ? 'Edit Medication' : 'Add New Medication'}</h2>

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
                            {isScanning ? '🔄 Scanning...' : '🔍 Scan Medication'}
                        </button>
                    </div>
                </div>
                
                {/* Scanner feedback */}
                {scanError && <div className="scan-error">⚠️ {scanError}</div>}
                {scanSuccess && <div className="scan-success">✅ {scanSuccess}</div>}
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
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
                <button type="submit" className="save-button" disabled={isScanning}>
                    {isScanning ? 'Processing...' : 'Save Medicine'}
                </button>
            </div>
        </form>
    );
}

export default MedicationForm;