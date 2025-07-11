import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Medication information fetcher
class MedicationInfoFetcher {
  constructor() {
    this.baseUrl = 'https://api.fda.gov/drug/label.json';
    this.cache = new Map();
    this.commonMedications = this.initializeCommonMedications();
  }

  initializeCommonMedications() {
    return new Map([
      ['amoxicillin', {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        brandName: 'Amoxil, Trimox',
        manufacturer: 'Various manufacturers',
        schedule: 'Not a controlled substance',
        usedFor: 'Bacterial infections including respiratory tract infections, urinary tract infections, skin infections, and dental infections. It works by stopping the growth of bacteria.',
        sideEffects: 'Common: Nausea, vomiting, diarrhea, stomach pain, headache. Serious: Allergic reactions, severe diarrhea (C. diff), liver problems. Contact doctor if you experience rash, difficulty breathing, or severe stomach pain.',
        warnings: 'Tell your doctor if you are allergic to penicillin or other antibiotics. Complete the full course even if you feel better. May reduce effectiveness of birth control pills.',
        dosageForm: 'Capsules, tablets, oral suspension',
        route: 'Oral',
        source: 'Medical Database'
      }],
      ['ibuprofen', {
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        brandName: 'Advil, Motrin',
        manufacturer: 'Various manufacturers',
        schedule: 'Not a controlled substance',
        usedFor: 'Pain relief, fever reduction, and inflammation. Used for headaches, muscle aches, arthritis, menstrual cramps, and minor injuries.',
        sideEffects: 'Common: Stomach upset, heartburn, dizziness. Serious: Stomach bleeding, kidney problems, heart attack, stroke. Take with food to reduce stomach irritation.',
        warnings: 'Do not take if allergic to aspirin or NSAIDs. Avoid alcohol. May increase bleeding risk. Consult doctor if you have heart, kidney, or stomach problems.',
        dosageForm: 'Tablets, capsules, oral suspension',
        route: 'Oral',
        source: 'Medical Database'
      }],
      ['acetaminophen', {
        name: 'Acetaminophen',
        genericName: 'Acetaminophen',
        brandName: 'Tylenol',
        manufacturer: 'Various manufacturers',
        schedule: 'Not a controlled substance',
        usedFor: 'Pain relief and fever reduction. Used for headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.',
        sideEffects: 'Generally well-tolerated when used as directed. Rare: Allergic reactions, liver damage with overdose. Signs of liver problems include nausea, stomach pain, loss of appetite, dark urine.',
        warnings: 'Do not exceed recommended dose. Avoid alcohol while taking. Check other medications for acetaminophen to prevent overdose. Maximum 4000mg per day for adults.',
        dosageForm: 'Tablets, capsules, oral suspension, suppositories',
        route: 'Oral, rectal',
        source: 'Medical Database'
      }],
      ['metformin', {
        name: 'Metformin',
        genericName: 'Metformin',
        brandName: 'Glucophage, Fortamet',
        manufacturer: 'Various manufacturers',
        schedule: 'Not a controlled substance',
        usedFor: 'Type 2 diabetes management. Helps control blood sugar levels by decreasing glucose production in the liver and improving insulin sensitivity.',
        sideEffects: 'Common: Nausea, diarrhea, stomach upset, metallic taste. Usually improve with time. Serious: Lactic acidosis (rare but serious), vitamin B12 deficiency with long-term use.',
        warnings: 'Monitor kidney function regularly. Stop before surgery or imaging with contrast. Avoid excessive alcohol. Tell doctor if you have kidney, liver, or heart problems.',
        dosageForm: 'Tablets, extended-release tablets',
        route: 'Oral',
        source: 'Medical Database'
      }],
      ['lisinopril', {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        brandName: 'Prinivil, Zestril',
        manufacturer: 'Various manufacturers',
        schedule: 'Not a controlled substance',
        usedFor: 'High blood pressure (hypertension) and heart failure. Also used after heart attacks to improve survival. Works by relaxing blood vessels.',
        sideEffects: 'Common: Dry cough, dizziness, headache, fatigue. Serious: Angioedema (swelling of face/throat), kidney problems, high potassium levels, low blood pressure.',
        warnings: 'Monitor blood pressure and kidney function. Avoid potassium supplements. Tell doctor if pregnant or planning pregnancy. Rise slowly from sitting/lying to prevent dizziness.',
        dosageForm: 'Tablets',
        route: 'Oral',
        source: 'Medical Database'
      }]
    ]);
  }

  correctMedicationName(name) {
    const corrections = {
      'amoriedlin': 'amoxicillin',
      'amoriecillin': 'amoxicillin',
      'amoxiedlin': 'amoxicillin',
      'amoxacillin': 'amoxicillin',
      'ibuprofin': 'ibuprofen',
      'ibuproven': 'ibuprofen',
      'tylenol': 'acetaminophen',
      'paracetamol': 'acetaminophen',
      'glucophage': 'metformin',
      'prinivil': 'lisinopril',
      'zestril': 'lisinopril'
    };
    
    const lowerName = name.toLowerCase();
    return corrections[lowerName] || lowerName;
  }

  async searchMedicationInfo(medicationName) {
    try {
      // Correct common OCR errors
      const correctedName = this.correctMedicationName(medicationName);
      
      // Check cache first
      if (this.cache.has(correctedName)) {
        return this.cache.get(correctedName);
      }

      // Check common medications database
      if (this.commonMedications.has(correctedName)) {
        const info = this.commonMedications.get(correctedName);
        this.cache.set(correctedName, info);
        return info;
      }

      // Search FDA API
      const fdaInfo = await this.searchFDA(correctedName);
      
      // If FDA doesn't have info, try with original name
      if (!fdaInfo && correctedName !== medicationName.toLowerCase()) {
        const originalFdaInfo = await this.searchFDA(medicationName);
        if (originalFdaInfo) {
          this.cache.set(correctedName, originalFdaInfo);
          return originalFdaInfo;
        }
      }

      if (fdaInfo) {
        this.cache.set(correctedName, fdaInfo);
        return fdaInfo;
      }

      // Return enhanced default info
      const defaultInfo = this.getEnhancedDefaultInfo(correctedName, medicationName);
      this.cache.set(correctedName, defaultInfo);
      return defaultInfo;
    } catch (error) {
      console.error('Error fetching medication info:', error);
      return this.getEnhancedDefaultInfo(medicationName, medicationName);
    }
  }

  async searchFDA(medicationName) {
    try {
      // Try multiple search strategies
      const searchQueries = [
        `openfda.brand_name:"${medicationName}"`,
        `openfda.generic_name:"${medicationName}"`,
        `openfda.brand_name:${medicationName}`,
        `openfda.generic_name:${medicationName}`
      ];

      for (const query of searchQueries) {
        const url = `${this.baseUrl}?search=${encodeURIComponent(query)}&limit=1`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const drug = data.results[0];
            return {
              name: medicationName,
              genericName: drug.openfda?.generic_name?.[0] || 'Generic name not available',
              brandName: drug.openfda?.brand_name?.[0] || 'Brand name not available',
              manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Manufacturer not available',
              schedule: this.extractSchedule(drug),
              usedFor: this.extractIndications(drug),
              sideEffects: this.extractSideEffects(drug),
              warnings: this.extractWarnings(drug),
              dosageForm: drug.openfda?.dosage_form?.[0] || 'Dosage form not available',
              route: drug.openfda?.route?.[0] || 'Route not available',
              source: 'FDA Database'
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('FDA API error:', error);
      return null;
    }
  }

  getEnhancedDefaultInfo(correctedName, originalName) {
    const suggestions = this.getMedicationSuggestions(correctedName);
    
    return {
      name: originalName,
      genericName: correctedName !== originalName.toLowerCase() ? `Possible: ${correctedName}` : 'Information not available',
      brandName: 'Information not available',
      manufacturer: 'Information not available',
      schedule: 'Information not available',
      usedFor: suggestions.usedFor || 'Consult your healthcare provider for specific indications and uses of this medication.',
      sideEffects: suggestions.sideEffects || 'Consult your healthcare provider for potential side effects. Report any unusual symptoms immediately.',
      warnings: suggestions.warnings || 'Follow your healthcare provider\'s instructions. Take only as prescribed. Do not share with others.',
      dosageForm: 'Information not available',
      route: 'Information not available',
      source: correctedName !== originalName.toLowerCase() ? 
        `Limited information available. Possible correction: ${correctedName}` : 
        'Limited information available'
    };
  }

  getMedicationSuggestions(medicationName) {
    const suggestions = {
      'antibiotic': {
        usedFor: 'Antibiotics are used to treat bacterial infections. Complete the full course even if symptoms improve.',
        sideEffects: 'Common side effects may include nausea, diarrhea, stomach upset. Serious: allergic reactions, severe diarrhea.',
        warnings: 'Take as prescribed. Do not skip doses. May interact with other medications.'
      },
      'pain': {
        usedFor: 'Pain relievers help manage pain and may reduce inflammation or fever.',
        sideEffects: 'May cause stomach upset, dizziness, or drowsiness. Some may affect kidney or liver function.',
        warnings: 'Do not exceed recommended dose. Avoid alcohol. Check with healthcare provider about interactions.'
      }
    };

    // Check if medication name contains common drug class indicators
    const lowerName = medicationName.toLowerCase();
    if (lowerName.includes('cillin') || lowerName.includes('mycin') || lowerName.includes('cycline')) {
      return suggestions.antibiotic;
    }
    
    return {};
  }

  async searchWeb(medicationName) {
    try {
      // Search for general medication information
      const searchQuery = `${medicationName} medication uses side effects schedule`;
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: medicationName,
          genericName: 'Information not available',
          brandName: 'Information not available',
          manufacturer: 'Information not available',
          schedule: 'Please consult healthcare provider',
          usedFor: 'Please consult healthcare provider for indications',
          sideEffects: 'Please consult healthcare provider for side effects',
          warnings: 'Please consult healthcare provider for warnings',
          dosageForm: 'N/A',
          route: 'N/A',
          source: 'Limited information available'
        };
      }
      
      return this.getDefaultInfo(medicationName);
    } catch (error) {
      console.error('Web search error:', error);
      return this.getDefaultInfo(medicationName);
    }
  }

  extractSchedule(drug) {
    if (drug.openfda?.dea_schedule) {
      return `Schedule ${drug.openfda.dea_schedule[0]}`;
    }
    return 'Not a controlled substance';
  }

  extractIndications(drug) {
    const fields = [
      'indications_and_usage',
      'clinical_pharmacology',
      'description'
    ];
    
    for (const field of fields) {
      if (drug[field] && drug[field].length > 0) {
        let text = drug[field][0];
        // Clean up the text and limit length
        text = text.replace(/\s+/g, ' ').trim();
        if (text.length > 400) {
          text = text.substring(0, 400) + '...';
        }
        return text;
      }
    }
    return 'Consult your healthcare provider for specific indications and uses.';
  }

  extractSideEffects(drug) {
    const fields = [
      'adverse_reactions',
      'warnings_and_cautions',
      'boxed_warning'
    ];
    
    for (const field of fields) {
      if (drug[field] && drug[field].length > 0) {
        let text = drug[field][0];
        text = text.replace(/\s+/g, ' ').trim();
        if (text.length > 400) {
          text = text.substring(0, 400) + '...';
        }
        return text;
      }
    }
    return 'Consult your healthcare provider for potential side effects. Report any unusual symptoms immediately.';
  }

  extractWarnings(drug) {
    const fields = [
      'warnings',
      'precautions',
      'contraindications',
      'boxed_warning'
    ];
    
    for (const field of fields) {
      if (drug[field] && drug[field].length > 0) {
        let text = drug[field][0];
        text = text.replace(/\s+/g, ' ').trim();
        if (text.length > 400) {
          text = text.substring(0, 400) + '...';
        }
        return text;
      }
    }
    return 'Follow your healthcare provider\'s instructions. Take only as prescribed. Do not share with others.';
  }

  getDefaultInfo(medicationName) {
    return {
      name: medicationName,
      genericName: 'Information not available',
      brandName: 'Information not available',
      manufacturer: 'Information not available',
      schedule: 'Please consult healthcare provider',
      usedFor: 'Please consult healthcare provider for indications',
      sideEffects: 'Please consult healthcare provider for side effects',
      warnings: 'Please consult healthcare provider for warnings',
      dosageForm: 'N/A',
      route: 'N/A',
      source: 'Information not available - consult healthcare provider'
    };
  }
}
class PrescriptionParser {
  constructor() {
    this.medicationPatterns = {
      medication: /(?:medication|med|drug|rx)[\s:]*([a-zA-Z\s\d]+)/gi,
      dosage: /(?:dosage|dose|strength)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(mg|g|ml|units?)/gi,
      frequency: /(?:frequency|take|times?)[\s:]*([0-9]+)[\s]*(?:times?|x)[\s]*(?:per|a)[\s]*(?:day|daily|week|weekly)/gi,
      quantity: /(?:quantity|qty)[\s:]*([0-9]+)/gi,
      instructions: /(?:instructions|directions|take)[\s:]*([^\n\r]+)/gi
    };
  }

  parseText(text) {
    const prescription = {
      medications: [],
      dosages: [],
      frequencies: [],
      quantities: [],
      instructions: [],
      rawText: text
    };

    // Extract medications
    let match;
    while ((match = this.medicationPatterns.medication.exec(text)) !== null) {
      prescription.medications.push(match[1].trim());
    }

    // Extract dosages
    while ((match = this.medicationPatterns.dosage.exec(text)) !== null) {
      prescription.dosages.push(`${match[1]} ${match[2]}`);
    }

    // Extract frequencies
    while ((match = this.medicationPatterns.frequency.exec(text)) !== null) {
      prescription.frequencies.push(match[0].trim());
    }

    // Extract quantities
    while ((match = this.medicationPatterns.quantity.exec(text)) !== null) {
      prescription.quantities.push(match[1]);
    }

    // Extract instructions
    while ((match = this.medicationPatterns.instructions.exec(text)) !== null) {
      prescription.instructions.push(match[1].trim());
    }

    return prescription;
  }

  // Enhanced parsing with common prescription patterns
  extractMedicationInfo(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const medications = [];

    for (const line of lines) {
      // Look for medication names (usually capitalized drug names)
      const drugMatch = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(\d+(?:\.\d+)?\s*(?:mg|g|ml|units?))/i);
      if (drugMatch) {
        medications.push({
          name: drugMatch[1],
          strength: drugMatch[2],
          originalLine: line
        });
      }
    }

    return medications;
  }
}

// Image preprocessing function
async function preprocessImage(imagePath) {
  try {
    const pathInfo = path.parse(imagePath);
    const processedPath = path.join(pathInfo.dir, pathInfo.name + '-processed.jpg');
    
    await sharp(imagePath)
      .resize(null, 800, { withoutEnlargement: true })
      .normalize()
      .sharpen()
      .jpeg({ quality: 90 })
      .toFile(processedPath);
    
    return processedPath;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    throw error;
  }
}

// OCR function
async function performOCR(imagePath) {
  try {
    console.log('Starting OCR process...');
    
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    console.log('OCR completed successfully');
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
}

// API Routes
app.post('/scan-prescription', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Processing prescription image:', req.file.filename);
    
    // Preprocess the image
    const processedImagePath = await preprocessImage(req.file.path);
    
    // Perform OCR
    const extractedText = await performOCR(processedImagePath);
    
    // Parse the prescription
    const parser = new PrescriptionParser();
    const prescriptionData = parser.parseText(extractedText);
    const medicationInfo = parser.extractMedicationInfo(extractedText);
    
    // Fetch detailed medication information
    const medicationFetcher = new MedicationInfoFetcher();
    const detailedMedications = [];
    
    for (const med of medicationInfo) {
      console.log(`Fetching info for: ${med.name}`);
      const info = await medicationFetcher.searchMedicationInfo(med.name);
      detailedMedications.push({
        ...med,
        details: info
      });
    }
    
    // Also search for medications found in general parsing
    for (const medName of prescriptionData.medications) {
      if (!detailedMedications.find(m => m.name.toLowerCase() === medName.toLowerCase())) {
        console.log(`Fetching info for: ${medName}`);
        const info = await medicationFetcher.searchMedicationInfo(medName);
        detailedMedications.push({
          name: medName,
          strength: 'N/A',
          originalLine: 'General parsing',
          details: info
        });
      }
    }
    
    // Clean up temporary processed file
    fs.unlinkSync(processedImagePath);
    
    const response = {
      success: true,
      data: {
        ...prescriptionData,
        detectedMedications: detailedMedications,
        confidence: extractedText.length > 50 ? 'high' : 'low',
        uploadedImage: `/uploads/${req.file.filename}`,
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Prescription scanning error:', error);
    res.status(500).json({ 
      error: 'Failed to process prescription',
      details: error.message 
    });
  }
});

// Get prescription history (in a real app, this would use a database)
app.get('/prescriptions', (req, res) => {
  // Mock data - in production, retrieve from database
  const prescriptions = [
    {
      id: 1,
      date: new Date().toISOString(),
      medications: ['Amoxicillin 500mg'],
      status: 'active'
    }
  ];
  
  res.json(prescriptions);
});

// Serve HTML interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prescription Scanner</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 20px; 
                background-color: #f5f5f5;
            }
            .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; }
            .upload-area { 
                border: 2px dashed #3498db; 
                padding: 40px; 
                text-align: center; 
                margin: 20px 0; 
                border-radius: 10px;
                background-color: #ecf0f1;
            }
            .upload-area.dragover { border-color: #2980b9; background-color: #d5dbdb; }
            button { 
                background-color: #3498db; 
                color: white; 
                padding: 12px 24px; 
                border: none; 
                cursor: pointer; 
                border-radius: 5px;
                font-size: 16px;
            }
            button:hover { background-color: #2980b9; }
            .result { margin-top: 20px; }
            .prescription-header { 
                display: flex; 
                gap: 20px; 
                margin-bottom: 20px; 
                align-items: flex-start;
            }
            .uploaded-image { 
                max-width: 300px; 
                max-height: 300px; 
                object-fit: contain; 
                border: 2px solid #ddd;
                border-radius: 8px;
            }
            .prescription-info { flex: 1; }
            .medication-card { 
                margin: 20px 0; 
                padding: 20px; 
                border: 1px solid #ddd; 
                border-radius: 8px;
                background-color: #fff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .medication-header { 
                background-color: #3498db; 
                color: white; 
                padding: 15px; 
                margin: -20px -20px 20px -20px;
                border-radius: 8px 8px 0 0;
            }
            .info-section { 
                margin: 15px 0; 
                padding: 10px; 
                background-color: #f8f9fa; 
                border-left: 4px solid #3498db;
            }
            .info-section h4 { margin: 0 0 10px 0; color: #2c3e50; }
            .info-section p { margin: 5px 0; }
            .schedule-badge { 
                background-color: #e74c3c; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-size: 12px;
                display: inline-block;
            }
            .loading { 
                display: none; 
                text-align: center; 
                margin: 20px 0; 
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            .loading-spinner { 
                border: 4px solid #f3f3f3; 
                border-top: 4px solid #3498db; 
                border-radius: 50%; 
                width: 40px; 
                height: 40px; 
                animation: spin 1s linear infinite; 
                margin: 0 auto 10px;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .raw-text { 
                background-color: #f8f9fa; 
                padding: 15px; 
                border-radius: 8px; 
                font-family: monospace; 
                white-space: pre-wrap; 
                max-height: 200px; 
                overflow-y: auto;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏥 Prescription Scanner</h1>
            <div class="upload-area" id="uploadArea">
                <p>📋 Drop prescription image here or click to select</p>
                <input type="file" id="fileInput" accept="image/*" style="display: none;">
                <button onclick="document.getElementById('fileInput').click()">Select Image</button>
            </div>
            
            <div class="loading" id="loading">
                <div class="loading-spinner"></div>
                <p>Processing prescription and fetching medication information...</p>
                <p><small>This may take a moment as we search medical databases.</small></p>
            </div>
            
            <div id="result"></div>
        </div>

        <script>
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    processFile(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    processFile(e.target.files[0]);
                }
            });

            async function processFile(file) {
                loading.style.display = 'block';
                result.innerHTML = '';

                const formData = new FormData();
                formData.append('prescription', file);

                try {
                    const response = await fetch('/scan-prescription', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    displayResult(data);
                } catch (error) {
                    result.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Error processing prescription: ' + error.message + '</div>';
                } finally {
                    loading.style.display = 'none';
                }
            }

            function displayResult(data) {
                if (data.success) {
                    let html = '<div class="result">';
                    
                    // Header with image and basic info
                    html += '<div class="prescription-header">';
                    if (data.data.uploadedImage) {
                        html += \`<img src="\${data.data.uploadedImage}" alt="Uploaded prescription" class="uploaded-image">\`;
                    }
                    html += '<div class="prescription-info">';
                    html += \`<h2>Prescription Analysis</h2>\`;
                    html += \`<p><strong>Processed:</strong> \${new Date(data.data.timestamp).toLocaleString()}</p>\`;
                    html += \`<p><strong>Confidence:</strong> \${data.data.confidence}</p>\`;
                    html += \`<p><strong>Medications Found:</strong> \${data.data.detectedMedications.length}</p>\`;
                    html += '</div></div>';
                    
                    // Detailed medication information
                    if (data.data.detectedMedications.length > 0) {
                        html += '<h3>📊 Detailed Medication Information</h3>';
                        data.data.detectedMedications.forEach((med, index) => {
                            html += \`<div class="medication-card">
                                <div class="medication-header">
                                    <h3>\${med.name} \${med.strength !== 'N/A' ? '- ' + med.strength : ''}</h3>
                                    <span class="schedule-badge">\${med.details.schedule}</span>
                                </div>
                                
                                <div class="info-section">
                                    <h4>🏷️ Basic Information</h4>
                                    <p><strong>Generic Name:</strong> \${med.details.genericName}</p>
                                    <p><strong>Brand Name:</strong> \${med.details.brandName}</p>
                                    <p><strong>Manufacturer:</strong> \${med.details.manufacturer}</p>
                                    <p><strong>Dosage Form:</strong> \${med.details.dosageForm}</p>
                                    <p><strong>Route:</strong> \${med.details.route}</p>
                                </div>
                                
                                <div class="info-section">
                                    <h4>💊 Used to Treat</h4>
                                    <p>\${med.details.usedFor}</p>
                                </div>
                                
                                <div class="info-section">
                                    <h4>⚠️ Side Effects</h4>
                                    <p>\${med.details.sideEffects}</p>
                                </div>
                                
                                <div class="info-section">
                                    <h4>🚨 Warnings</h4>
                                    <p>\${med.details.warnings}</p>
                                </div>
                                
                                <div class="info-section">
                                    <h4>📋 Prescription Details</h4>
                                    <p><strong>Detected from:</strong> \${med.originalLine}</p>
                                    <p><strong>Information source:</strong> \${med.details.source}</p>
                                </div>
                            </div>\`;
                        });
                    }
                    
                    // Additional prescription details
                    if (data.data.dosages.length > 0) {
                        html += '<div class="info-section"><h4>💊 Dosages Found:</h4><ul>';
                        data.data.dosages.forEach(dose => {
                            html += '<li>' + dose + '</li>';
                        });
                        html += '</ul></div>';
                    }
                    
                    if (data.data.instructions.length > 0) {
                        html += '<div class="info-section"><h4>📝 Instructions:</h4><ul>';
                        data.data.instructions.forEach(instruction => {
                            html += '<li>' + instruction + '</li>';
                        });
                        html += '</ul></div>';
                    }
                    
                    // Raw text section
                    html += '<div class="info-section">';
                    html += '<h4>📄 Raw Extracted Text:</h4>';
                    html += '<div class="raw-text">' + data.data.rawText + '</div>';
                    html += '</div>';
                    
                    html += '</div>';
                    
                    result.innerHTML = html;
                } else {
                    result.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Error: ' + data.error + '</div>';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Prescription scanner running on http://localhost:${PORT}`);
  console.log('Upload prescription images to scan and extract medication information');
});

export default app;