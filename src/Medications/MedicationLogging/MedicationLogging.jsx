import React, { useState, useRef, useEffect } from 'react';
import './MedicationLogging.css';
import MedicationItem from '../MedicationItem/MedicationItem';

function MedicationLogging({ medications, onSelect, selectedMedicationId, onAddNew, onToggleDose }) {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedFile, setCapturedFile] = useState(null);
    const [cameraError, setCameraError] = useState('');
    const [isLoadingCamera, setIsLoadingCamera] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');
    const [facingMode, setFacingMode] = useState('environment'); // Start with back camera for boxes
    const [isFlipped, setIsFlipped] = useState(false); // Track if image is flipped
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Helper to determine if we're in "adding new" mode
    const isAddingNew = !selectedMedicationId;

    // Cleanup camera stream when component unmounts
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Start camera
    const startCamera = async () => {
        console.log('Start camera button clicked');
        setCameraError('');
        setIsLoadingCamera(true);
        setDebugInfo('Requesting camera access...');
        
        try {
            // Check if camera is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera is not supported on this device or browser.');
            }

            setDebugInfo('Camera API available, requesting stream...');

            const constraints = {
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 }
                },
                audio: false
            };

            console.log('Requesting camera with constraints:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            setDebugInfo(`Stream obtained: ${stream.getVideoTracks().length} video tracks`);
            console.log('Camera stream obtained:', stream);
            
            // Store stream first
            streamRef.current = stream;
            setIsCameraActive(true);
            
            // Wait a moment for React to render the video element
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!videoRef.current) {
                throw new Error('Video element not found. Please try again.');
            }
            
            setDebugInfo('Video element found, assigning stream...');
            
            // Assign stream to video element
            videoRef.current.srcObject = stream;
            
            setDebugInfo('Stream assigned to video element, waiting for video to load...');
            
            // Wait for video to be ready and force play
            const playVideo = async () => {
                try {
                    if (!videoRef.current) {
                        throw new Error('Video element lost during playback setup');
                    }
                    
                    // Wait for metadata to load
                    if (videoRef.current.readyState === 0) {
                        await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => reject(new Error('Metadata load timeout')), 10000);
                            videoRef.current.onloadedmetadata = () => {
                                clearTimeout(timeout);
                                resolve();
                            };
                        });
                    }
                    
                    if (videoRef.current) {
                        await videoRef.current.play();
                        setDebugInfo('Video playing successfully');
                        setIsLoadingCamera(false);
                        console.log('Video is now playing');
                    }
                } catch (playError) {
                    console.error('Play error:', playError);
                    setDebugInfo(`Play failed: ${playError.message}. Try manual continue.`);
                    // Don't clear loading here, let user manually continue
                }
            };
            
            // Try to play immediately
            playVideo();
            
            // Fallback timeout
            setTimeout(() => {
                if (isLoadingCamera) {
                    setDebugInfo('Auto-play timeout. Use "Continue" button if you see video.');
                }
            }, 5000);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setIsLoadingCamera(false);
            setIsCameraActive(false);
            setDebugInfo('');
            let errorMessage = 'Could not access camera. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera permissions and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Camera is not supported on this browser.';
            } else {
                errorMessage += error.message || 'Please check your camera and try again.';
            }
            
            setCameraError(errorMessage);
        }
    };

    // Cancel camera and clear everything
    const cancelCamera = () => {
        console.log('cancelCamera called - clearing all states');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraActive(false);
        setCapturedImage(null);
        setCapturedFile(null);
        setCameraError('');
        setIsLoadingCamera(false);
        setDebugInfo('');
        console.log('Camera canceled and all states cleared');
    };

    // Stop camera
    const stopCamera = () => {
        console.log('stopCamera called');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraActive(false);
        // Don't clear captured image here - let user decide what to do with it
        // setCapturedImage(null); // REMOVED - this was clearing the captured photo!
        setCameraError('');
        setIsLoadingCamera(false);
        setDebugInfo('');
        console.log('Camera stopped, captured image preserved');
    };

    // Test video element manually
    const testVideoElement = () => {
        if (videoRef.current && streamRef.current) {
            const video = videoRef.current;
            console.log('Video element state:', {
                readyState: video.readyState,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                paused: video.paused,
                ended: video.ended,
                srcObject: !!video.srcObject,
                currentTime: video.currentTime
            });
            
            // Force play again
            video.play().then(() => {
                console.log('Manual play successful');
                setDebugInfo('Manual play successful');
            }).catch(err => {
                console.error('Manual play failed:', err);
                setDebugInfo(`Manual play failed: ${err.message}`);
            });
        }
    };

    // Switch camera
    const switchCamera = async () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        setDebugInfo(`Switching to ${newFacingMode === 'user' ? 'front' : 'back'} camera...`);
        
        // Restart camera with new facing mode
        setTimeout(() => {
            startCamera();
        }, 100);
    };

    // Flip image horizontally (for better readability)
    const flipImage = () => {
        setIsFlipped(!isFlipped);
        setDebugInfo(`Image ${!isFlipped ? 'flipped' : 'unflipped'} horizontally`);
    };

    // Capture photo
    const capturePhoto = () => {
        console.log('Capture photo button clicked');
        
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            
            console.log('Video and canvas elements found', {
                videoReadyState: video.readyState,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight
            });
            
            // Check if video is ready
            if (video.readyState !== 4) {
                console.error('Video not ready, readyState:', video.readyState);
                setCameraError('Video is not ready yet. Please wait a moment and try again.');
                return;
            }
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            
            const context = canvas.getContext('2d');
            
            // Apply flip transformation if enabled
            if (isFlipped) {
                context.scale(-1, 1);
                context.translate(-canvas.width, 0);
            }
            
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            console.log('Image drawn to canvas, converting to blob...');
            
            // Convert to blob and show captured image
            canvas.toBlob((blob) => {
                if (blob) {
                    console.log('Blob created successfully:', {
                        size: blob.size,
                        type: blob.type
                    });
                    
                    const imageUrl = URL.createObjectURL(blob);
                    console.log('Created image URL:', imageUrl);
                    setCapturedImage(imageUrl);
                    console.log('Set capturedImage state');
                    
                    // Store the file for later use
                    const file = new File([blob], `medication-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setCapturedFile(file);
                    console.log('Set capturedFile state');
                    
                    console.log('Photo captured successfully:', file);
                    setDebugInfo('Photo captured! Choose an option below.');
                    
                    // Stop the camera after capture
                    console.log('Stopping camera...');
                    stopCamera();
                    console.log('Camera stopped, captured image should now be visible');
                } else {
                    console.error('Failed to create blob from canvas');
                    setCameraError('Failed to capture photo. Please try again.');
                }
            }, 'image/jpeg', 0.9);
        } else {
            console.error('Video or canvas element not found', {
                video: !!videoRef.current,
                canvas: !!canvasRef.current
            });
            setCameraError('Camera not available. Please try again.');
        }
    };

    // Use captured photo to add new medication
    const useCapturedPhoto = () => {
        console.log('useCapturedPhoto clicked!');
        console.log('capturedFile state:', capturedFile);
        if (capturedFile) {
            console.log('Using captured photo for new medication:', capturedFile);
            onAddNew(capturedFile);
            // Clear captured state
            setCapturedImage(null);
            setCapturedFile(null);
            console.log('Cleared captured states and called onAddNew');
        } else {
            console.error('No captured file available!');
        }
    };

    // Retake photo
    const retakePhoto = () => {
        setCapturedImage(null);
        setCapturedFile(null);
        startCamera();
    };

    // Discard captured photo
    const discardPhoto = () => {
        setCapturedImage(null);
        setCapturedFile(null);
        setDebugInfo('');
    };

    // Handle file upload
    const handleFileUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected:', file);
                
                // Import and validate using the scanner service
                import('../services/medicationScannerService').then(({ default: scannerService }) => {
                    if (scannerService.validateImageFile(file)) {
                        console.log('File validation passed, calling onAddNew');
                        onAddNew(file);
                    } else {
                        console.error('File validation failed');
                        setCameraError('Please select a valid image file (JPEG, PNG, WebP) under 10MB');
                    }
                }).catch(error => {
                    console.error('Error importing scanner service:', error);
                    setCameraError('Error validating file. Please try again.');
                });
            } else {
                console.log('No file selected');
                setCameraError('No file was selected. Please try again.');
            }
        };
        input.click();
    };

    return (
        <div className="card logging-card">
            <h2 className="card-header">Medication Logging</h2>
            <p className="sub-header">Has your care recipient taken:</p>

            <div className="medication-list">
                {medications.map((med) => (
                    <MedicationItem 
                        key={med.id}
                        medication={med}
                        onSelect={onSelect}
                        isSelected={selectedMedicationId === med.id}
                        onToggleDose={onToggleDose}
                    />
                ))}
            </div>

            <div className="add-medication-section">
                <button 
                    className={isAddingNew ? "add-medication-button selected" : "add-medication-button"} 
                    onClick={() => onAddNew()}
                >
                    <div className="add-icon">+</div>
                    <span>Add more medication</span>
                </button>
            </div>
            
            {!isCameraActive ? (
                <div>
                    <div className="action-buttons">
                        <button className="upload-button" onClick={handleFileUpload}>Upload Image</button>
                        <button 
                            className="camera-button" 
                            onClick={startCamera}
                            disabled={isLoadingCamera}
                        >
                            {isLoadingCamera ? 'Starting Camera...' : 'Use Camera'}
                        </button>
                    </div>
                    {cameraError && (
                        <div className="camera-error">
                            ⚠️ {cameraError}
                        </div>
                    )}
                    {isLoadingCamera && (
                        <div className="camera-loading">
                            📷 Initializing camera... Please allow camera permissions if prompted.
                        </div>
                    )}
                </div>
            ) : (
                <div className="camera-container">
                    {isLoadingCamera && (
                        <div className="camera-loading-overlay">
                            📷 Starting camera...
                            {debugInfo && <div className="debug-info">{debugInfo}</div>}
                            <button 
                                className="force-continue-button"
                                onClick={() => {
                                    setIsLoadingCamera(false);
                                    setDebugInfo('');
                                }}
                            >
                                Camera working? Click to continue
                            </button>
                        </div>
                    )}
                    
                    {/* Always render video element when camera is active */}
                    <div className="video-wrapper">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            muted
                            controls={false}
                            className="camera-video"
                            style={{
                                width: '100%',
                                height: '300px',
                                backgroundColor: '#000',
                                display: 'block',
                                objectFit: 'cover',
                                border: '2px solid #00ff00', // Temporary green border to see video bounds
                                transform: isFlipped ? 'scaleX(-1)' : 'none' // Apply flip transformation
                            }}
                            onLoadedMetadata={(e) => {
                                console.log('Video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight);
                                setDebugInfo(`Video loaded: ${e.target.videoWidth}x${e.target.videoHeight}`);
                                // Try to play again when metadata is loaded
                                e.target.play().catch(err => console.log('Play after metadata failed:', err));
                            }}
                            onCanPlay={(e) => {
                                console.log('Video can play');
                                setDebugInfo('Video ready to play');
                                setIsLoadingCamera(false);
                                e.target.play().catch(err => console.log('Play on canplay failed:', err));
                            }}
                            onPlaying={() => {
                                console.log('Video is playing');
                                setIsLoadingCamera(false);
                                setDebugInfo('');
                            }}
                            onLoadStart={() => {
                                console.log('Video load started');
                                setDebugInfo('Video loading...');
                            }}
                            onWaiting={() => {
                                console.log('Video waiting for data');
                                setDebugInfo('Video buffering...');
                            }}
                            onSuspend={() => {
                                console.log('Video suspended');
                            }}
                            onError={(e) => {
                                console.error('Video error:', e);
                                setCameraError('Video playback error. Please try again.');
                                setIsLoadingCamera(false);
                            }}
                        />
                        
                        {/* Camera instructions overlay */}
                        <div className="camera-instructions">
                            📋 For medication boxes: Hold steady, ensure text is clear and well-lit
                        </div>
                        
                        {/* Debug overlay showing video element status */}
                        <div className="video-debug-overlay">
                            <div>Video Element: {videoRef.current ? 'Found' : 'Missing'}</div>
                            <div>Camera: {facingMode === 'user' ? 'Front' : 'Back'}</div>
                            <div>Flipped: {isFlipped ? 'Yes' : 'No'}</div>
                            {streamRef.current && (
                                <div>Stream: {streamRef.current.getVideoTracks().length} tracks active</div>
                            )}
                            {videoRef.current && (
                                <div>Video Size: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</div>
                            )}
                        </div>
                    </div>
                    
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-controls">
                        <button 
                            className="capture-button" 
                            onClick={capturePhoto}
                            disabled={isLoadingCamera}
                        >
                            📷 Capture
                        </button>
                        <button 
                            className="switch-camera-button" 
                            onClick={switchCamera}
                            disabled={isLoadingCamera}
                            title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
                        >
                            🔄 {facingMode === 'user' ? 'Back' : 'Front'}
                        </button>
                        <button 
                            className="flip-button" 
                            onClick={flipImage}
                            disabled={isLoadingCamera}
                            title="Flip image horizontally"
                        >
                            ↔️ Flip
                        </button>
                        <button 
                            className="test-button" 
                            onClick={testVideoElement}
                            disabled={isLoadingCamera}
                            title="Test Video"
                        >
                            🔧 Test
                        </button>
                        <button className="cancel-camera-button" onClick={cancelCamera}>❌ Cancel</button>
                    </div>
                </div>
            )}
            
            {/* Captured Image Preview */}
            {capturedImage && (
                <div className="captured-image-container">
                    <h3>📸 Photo Captured</h3>
                    <div className="captured-image-preview">
                        <img src={capturedImage} alt="Captured medication" className="captured-image" />
                    </div>
                    <div className="captured-image-actions">
                        <button 
                            className="use-photo-button" 
                            onClick={useCapturedPhoto}
                        >
                            ✅ Use This Photo
                        </button>
                        <button 
                            className="retake-button" 
                            onClick={retakePhoto}
                        >
                            🔄 Retake
                        </button>
                        <button 
                            className="discard-button" 
                            onClick={discardPhoto}
                        >
                            ❌ Discard
                        </button>
                    </div>
                </div>
            )}
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    Debug: isCameraActive={String(isCameraActive)}, capturedImage={capturedImage ? 'set' : 'null'}, capturedFile={capturedFile ? 'set' : 'null'}
                </div>
            )}
        </div>
    );
}

export default MedicationLogging;
