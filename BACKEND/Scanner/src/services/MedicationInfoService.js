import { OpenAI } from 'openai';

/**
 * Enhanced Medication Information Service
 * Combines multiple data sources for comprehensive medication information
 */
class MedicationInfoService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.commonMedications = this.initializeCommonMedications();
    this.medicationPatterns = this.initializeMedicationPatterns();
    
    // Initialize OpenAI client only if API key is available
    if (process.env.OPENAI_API_KEY && process.env.NODE_ENV !== 'test') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else {
      this.openai = null;
    }
  }

  initializeCommonMedications() {
    // Removed local medication database - all information now sourced from online APIs
    // This ensures consistency and reliability by using authoritative medical sources
    return new Map();
  }

  initializeMedicationPatterns() {
    return {
      // Common OCR errors and corrections
      corrections: {
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
      },
      // Regex patterns for medication extraction
      medicationName: /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:\d+(?:\.\d+)?\s*(?:mg|g|ml|units?))?/gi,
      dosage: /(\d+(?:\.\d+)?)\s*(mg|g|ml|units?|mcg|µg)/gi,
      frequency: /(?:take|every|once|twice|three times?|(\d+)\s*times?)\s*(?:daily|per day|a day|bid|tid|qid)/gi,
      schedule: /(?:morning|evening|night|bedtime|with meals?|before meals?|after meals?|\d{1,2}:\d{2}(?:\s*(?:am|pm))?)/gi
    };
  }

  async searchMedicationInfo(medicationName, extractedText = '') {
    try {
      const correctedName = this.correctMedicationName(medicationName);
      
      // Check cache first (but always verify with fresh data for critical information)
      const cacheKey = correctedName.toLowerCase();
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          console.log(`Using cached data for ${medicationName} (${cached.data.sources?.join(', ') || 'unknown sources'})`);
          return cached.data;
        }
      }

      console.log(`Searching online sources for medication: ${medicationName}`);

      // Always check online sources for the most up-to-date and reliable information
      const sources = await Promise.allSettled([
        this.searchFDADatabase(correctedName),
        this.searchOpenFDA(correctedName),
        this.searchDrugBank(correctedName),
        this.searchNIHDatabase(correctedName),
        this.searchRxNavAPI(correctedName)
      ]);

      // Combine results from multiple authoritative sources
      const medicationInfo = await this.combineSourceResults(sources, correctedName, medicationName);
      
      // Enhanced with context from extracted text
      if (extractedText) {
        medicationInfo.extractedContext = this.extractContextualInfo(extractedText, correctedName);
      }

      // Only cache if we got reliable information
      if (medicationInfo.confidence > 0.3 && medicationInfo.sources.length > 0) {
        this.cache.set(cacheKey, {
          data: medicationInfo,
          timestamp: Date.now()
        });
        console.log(`Cached medication data for ${medicationName} from sources: ${medicationInfo.sources.join(', ')}`);
      }

      return medicationInfo;
    } catch (error) {
      console.error('Error searching medication info:', error);
      return this.getDefaultMedicationInfo(medicationName);
    }
  }

  correctMedicationName(name) {
    const cleaned = name.trim().toLowerCase().replace(/[^\w\s]/g, '');
    return this.medicationPatterns.corrections[cleaned] || cleaned;
  }

  async searchCommonMedications(medicationName) {
    // This method is kept for backward compatibility but no longer uses local database
    console.log(`Common medications search for ${medicationName}: Using online sources only`);
    return null; // Force online search
  }

  async searchFDADatabase(medicationName) {
    try {
      console.log(`Searching FDA database for: ${medicationName}`);
      
      const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${medicationName}"+openfda.generic_name:"${medicationName}"&limit=5`);
      
      if (!response.ok) {
        console.log(`FDA API response not ok: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        console.log(`FDA database found ${data.results.length} results for ${medicationName}`);
        return this.parseFDAResult(data.results[0], medicationName);
      }
      
      console.log(`No FDA results found for ${medicationName}`);
      return null;
    } catch (error) {
      console.error('FDA database search error:', error);
      return null;
    }
  }

  async searchOpenFDA(medicationName) {
    try {
      console.log(`Searching OpenFDA for: ${medicationName}`);
      
      const response = await fetch(`https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${medicationName}"&limit=1`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        console.log(`OpenFDA found results for ${medicationName}`);
        return this.parseOpenFDAResult(data.results[0], medicationName);
      }
      
      return null;
    } catch (error) {
      console.error('OpenFDA search error:', error);
      return null;
    }
  }

  async searchDrugBank(medicationName) {
    // DrugBank API requires authentication - placeholder for future implementation
    console.log(`DrugBank search for ${medicationName}: Not implemented (requires API key)`);
    return null;
  }

  async searchNIHDatabase(medicationName) {
    try {
      console.log(`Searching NIH database for: ${medicationName}`);
      
      // MedlinePlus API search
      const response = await fetch(`https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(medicationName)}&retmax=5&rettype=json`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      if (data.list && data.list.document && data.list.document.length > 0) {
        console.log(`NIH database found results for ${medicationName}`);
        return {
          source: 'NIH/MedlinePlus',
          name: medicationName,
          confidence: 0.7,
          usedFor: data.list.document[0].content || 'Information available from NIH MedlinePlus'
        };
      }
      
      return null;
    } catch (error) {
      console.error('NIH database search error:', error);
      return null;
    }
  }

  async searchRxNavAPI(medicationName) {
    try {
      console.log(`Searching RxNav API for: ${medicationName}`);
      
      // First, get the concept ID
      const conceptResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(medicationName)}`);
      
      if (!conceptResponse.ok) return null;
      
      const conceptData = await conceptResponse.json();
      
      if (conceptData.drugGroup && conceptData.drugGroup.conceptGroup && conceptData.drugGroup.conceptGroup.length > 0) {
        const concepts = conceptData.drugGroup.conceptGroup[0].conceptProperties;
        
        if (concepts && concepts.length > 0) {
          console.log(`RxNav found concept for ${medicationName}`);
          return {
            source: 'RxNav',
            name: medicationName,
            genericName: concepts[0].name,
            confidence: 0.75
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('RxNav search error:', error);
      return null;
    }
  }

  async combineSourceResults(sources, correctedName, originalName) {
    const validResults = sources
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    // Check if we have low-confidence results that might benefit from AI enhancement
    const hasLowConfidenceResults = validResults.length > 0 && 
      validResults.every(result => result.confidence < 0.4);

    // Enhanced fallback strategy: Try AI when FDA/online sources fail or provide poor results
    if (validResults.length === 0) {
      console.log(`🤖 No valid results from FDA/online sources for "${originalName}", using OpenAI as fallback database...`);
      const aiResult = await this.getAIChatbotMedicationInfo(originalName);
      if (aiResult && aiResult.confidence > 0.4) {
        console.log(`✅ OpenAI fallback successfully provided information for "${originalName}" (confidence: ${aiResult.confidence})`);
        return aiResult;
      } else {
        console.log(`❌ OpenAI fallback did not find reliable information for "${originalName}"`);
        return this.getDefaultMedicationInfo(originalName);
      }
    }

    if (hasLowConfidenceResults) {
      console.log(`⚠️  Low confidence results from FDA/online sources for "${originalName}", enhancing with OpenAI...`);
      const aiResult = await this.getAIChatbotMedicationInfo(originalName);
      if (aiResult && aiResult.confidence > 0.5) {
        // If AI provides better information, use a hybrid approach
        const hybridResult = this.createHybridResult(validResults, aiResult, originalName);
        console.log(`🔄 Created hybrid result combining FDA/online sources and OpenAI for "${originalName}"`);
        return hybridResult;
      } else {
        console.log(`📊 Using original FDA/online results for "${originalName}" as AI enhancement was not more reliable`);
      }
    }

    // Combine information from multiple sources
    const combined = {
      name: originalName,
      genericName: this.selectBestValue(validResults, 'genericName') || 'Not available',
      brandNames: this.collectUniqueValues(validResults, 'brandNames') || ['Not available'],
      strength: this.selectBestValue(validResults, 'strength') || 'Consult prescription label',
      usedFor: this.selectBestValue(validResults, 'usedFor') || 'Consult healthcare provider for indications',
      sideEffects: this.selectBestValue(validResults, 'sideEffects') || 'Consult healthcare provider for side effects',
      warnings: this.selectBestValue(validResults, 'warnings') || 'Follow healthcare provider instructions',
      dosageForm: this.selectBestValue(validResults, 'dosageForm') || 'Various forms available',
      schedule: this.selectBestValue(validResults, 'schedule') || 'Follow prescription instructions',
      confidence: this.calculateCombinedConfidence(validResults),
      sources: validResults.map(r => r.source).filter(Boolean),
      dataSource: 'multiple_online_sources',
      searchedAt: new Date().toISOString()
    };

    console.log(`Combined medication info for ${originalName} from ${combined.sources.length} sources with confidence ${combined.confidence}`);
    return combined;
  }

  selectBestValue(results, field) {
    const values = results
      .map(r => r[field])
      .filter(v => v && v !== 'Not available' && v !== 'Information not available online');
    
    if (values.length === 0) return null;
    
    // Return the longest, most detailed value
    return values.reduce((best, current) => {
      if (typeof current === 'string' && typeof best === 'string') {
        return current.length > best.length ? current : best;
      }
      return current || best;
    });
  }

  collectUniqueValues(results, field) {
    const allValues = results
      .map(r => r[field])
      .filter(v => v && Array.isArray(v))
      .flat()
      .filter(v => v && v !== 'Not available');
    
    return [...new Set(allValues)];
  }

  calculateCombinedConfidence(results) {
    if (results.length === 0) return 0.1;
    
    // Weight confidence by source reliability
    const weightedConfidence = results.reduce((sum, result) => {
      const weight = this.getSourceWeight(result.source);
      const confidence = result.confidence || 0.7;
      return sum + (weight * confidence);
    }, 0) / results.length;

    // Higher confidence for multiple authoritative sources
    const sourceMultiplier = Math.min(1 + (results.length - 1) * 0.1, 1.2);
    
    return Math.min(weightedConfidence * sourceMultiplier, 0.95);
  }

  getSourceWeight(source) {
    const weights = {
      'FDA': 1.0,                    // Primary authoritative source
      'NIH/MedlinePlus': 0.95,       // Highly reliable government source
      'RxNav': 0.9,                  // NLM/NIH medication database
      'OpenFDA': 0.85,               // FDA adverse event database
      'DrugBank': 0.8,               // Academic pharmaceutical database
      'OpenAI_Database': 0.75,       // AI fallback database (comprehensive)
      'AI_Enhanced': 0.75,           // AI enhancing existing data
      'AI_Assistant': 0.6,           // General AI assistance
      'fallback_system': 0.1         // Last resort fallback
    };
    
    return weights[source] || 0.7;
  }

  /**
   * Create a hybrid result combining online sources with AI enhancement
   */
  createHybridResult(onlineResults, aiResult, originalName) {
    const combined = {
      name: aiResult.correctedName || originalName, // Use AI corrected name if available
      originalSearchTerm: originalName,
      genericName: this.selectBestValue(onlineResults, 'genericName') || aiResult.genericName || 'Not available',
      brandNames: this.collectUniqueValues(onlineResults, 'brandNames') || aiResult.brandNames || ['Not available'],
      strength: this.selectBestValue(onlineResults, 'strength') || aiResult.strength || 'Consult prescription label',
      usedFor: this.selectBestValue(onlineResults, 'usedFor') || aiResult.usedFor || 'Consult healthcare provider for indications',
      sideEffects: this.selectBestValue(onlineResults, 'sideEffects') || aiResult.sideEffects || 'Consult healthcare provider for side effects',
      warnings: this.selectBestValue(onlineResults, 'warnings') || aiResult.warnings || 'Follow healthcare provider instructions',
      dosageForm: this.selectBestValue(onlineResults, 'dosageForm') || 'Various forms available',
      schedule: this.selectBestValue(onlineResults, 'schedule') || aiResult.schedule || 'Follow prescription instructions',
      drugClass: aiResult.drugClass || 'Contact healthcare provider for classification', // AI often has better drug class info
      mechanism: aiResult.mechanism || 'Consult healthcare provider for mechanism of action', // AI often has better mechanism info
      confidence: this.calculateHybridConfidence(onlineResults, aiResult),
      sources: [...onlineResults.map(r => r.source).filter(Boolean), 'OpenAI_Enhanced'],
      dataSource: 'hybrid_fda_ai',
      searchedAt: new Date().toISOString(),
      note: 'Information combined from FDA/medical databases enhanced with OpenAI fallback database for comprehensive coverage.',
      correctionApplied: aiResult.correctedName ? `Original search: "${originalName}" → AI corrected to: "${aiResult.correctedName}"` : null
    };

    return combined;
  }

  /**
   * Calculate confidence for hybrid results
   */
  calculateHybridConfidence(onlineResults, aiResult) {
    const onlineConfidence = this.calculateCombinedConfidence(onlineResults);
    const aiConfidence = aiResult.confidence || 0.75; // Default OpenAI fallback database confidence
    
    // If we have both online and AI data, weight them appropriately
    if (onlineConfidence > 0 && aiResult) {
      return Math.min((onlineConfidence * 0.7) + (aiConfidence * 0.3), 0.85);
    }
    
    // If only AI data (fallback database scenario), use AI confidence with slight reduction
    if (onlineConfidence === 0 && aiResult) {
      console.log('📊 Using OpenAI fallback database confidence:', aiConfidence);
      return Math.max(0.6, aiConfidence * 0.85); // Slight confidence reduction for fallback only
    }
    
    // If only online data, use online confidence
    return onlineConfidence;
  }

  parseFDAResult(fdaResult, medicationName) {
    const result = {
      source: 'FDA',
      name: medicationName,
      genericName: fdaResult.openfda?.generic_name?.[0] || 'Not available',
      brandNames: fdaResult.openfda?.brand_name || ['Not available'],
      manufacturer: fdaResult.openfda?.manufacturer_name?.[0] || 'Not available',
      usedFor: this.extractIndications(fdaResult),
      sideEffects: this.extractSideEffects(fdaResult),
      warnings: this.extractWarnings(fdaResult),
      dosageForm: fdaResult.openfda?.dosage_form?.[0] || 'Not available',
      route: fdaResult.openfda?.route?.[0] || 'Not available',
      confidence: 0.85
    };

    // Also try to extract more comprehensive usage information
    const comprehensiveUsage = this.extractComprehensiveUsage(fdaResult);
    if (comprehensiveUsage && comprehensiveUsage.length > result.usedFor.length) {
      result.usedFor = comprehensiveUsage;
    }

    return result;
  }

  parseOpenFDAResult(result, medicationName) {
    return {
      source: 'OpenFDA',
      name: medicationName,
      genericName: result.openfda?.generic_name?.[0] || 'Not available',
      brandNames: result.openfda?.brand_name || ['Not available'],
      confidence: 0.8
    };
  }

  extractIndications(drug) {
    // Prioritize indications_and_usage field for better "used to treat" information
    const prioritizedFields = ['indications_and_usage', 'description', 'clinical_pharmacology'];
    
    for (const field of prioritizedFields) {
      if (drug[field] && drug[field].length > 0) {
        let text = drug[field][0].replace(/\s+/g, ' ').trim();
        
        // Enhanced extraction specifically for usage/treatment information
        const usageInfo = this.extractSpecificUsageInfo(text);
        if (usageInfo && usageInfo.length > 50) {
          return this.formatFDAMedicationText(usageInfo, 'indications');
        }
        
        // Fallback to formatted full text if no specific usage found
        text = this.formatFDAMedicationText(text, 'indications');
        return text.length > 800 ? text.substring(0, 800) + '...' : text;
      }
    }
    return 'Please consult your healthcare provider for specific indications and proper usage information.';
  }

  extractSideEffects(drug) {
    const fields = ['adverse_reactions', 'warnings_and_cautions', 'boxed_warning'];
    for (const field of fields) {
      if (drug[field] && drug[field].length > 0) {
        let text = drug[field][0].replace(/\s+/g, ' ').trim();
        text = this.formatFDAMedicationText(text, 'adverse_reactions');
        return text.length > 800 ? text.substring(0, 800) + '...' : text;
      }
    }
    return 'Consult healthcare provider for potential side effects and report any unusual symptoms immediately.';
  }

  extractWarnings(drug) {
    const fields = ['warnings', 'precautions', 'contraindications', 'boxed_warning'];
    for (const field of fields) {
      if (drug[field] && drug[field].length > 0) {
        let text = drug[field][0].replace(/\s+/g, ' ').trim();
        text = this.formatFDAMedicationText(text, 'warnings');
        return text.length > 800 ? text.substring(0, 800) + '...' : text;
      }
    }
    return 'Follow healthcare provider instructions exactly. Take only as prescribed.';
  }

  // Format medication text for better readability
  formatMedicationText(text) {
    if (!text) return text;
    
    // Clean up the text first
    let formatted = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*•\s*/g, '\n• ') // Format bullet points properly
      .replace(/\s*:\s*/g, ': ') // Clean up colons
      .replace(/\s*,\s*/g, ', ') // Clean up commas
      .trim();

    // Handle common medication text patterns
    formatted = formatted
      .replace(/^Uses\s*•/i, 'Uses:\n•') // Format "Uses" section
      .replace(/temporarily relieves/gi, 'Temporarily relieves') // Capitalize properly
      .replace(/temporarily reduces/gi, 'Temporarily reduces')
      .replace(/minor aches and pains due to:/gi, 'minor aches and pains due to:')
      .replace(/the common cold/gi, 'the common cold')
      .replace(/premenstrual and menstrual cramps/gi, 'premenstrual and menstrual cramps');

    // Split into lines and clean each line
    const lines = formatted.split('\n');
    const cleanedLines = lines.map(line => {
      line = line.trim();
      
      // Capitalize first letter of each line if it's not a bullet point
      if (line && !line.startsWith('•') && line.length > 0) {
        line = line.charAt(0).toUpperCase() + line.slice(1);
      }
      
      // Clean up bullet point formatting
      if (line.startsWith('•')) {
        line = line.replace(/^•\s*/, '• ').trim();
        // Ensure proper spacing after bullet
        if (!line.startsWith('• ')) {
          line = '• ' + line.substring(1);
        }
      }
      
      return line;
    });

    // Rejoin and final cleanup
    formatted = cleanedLines
      .filter(line => line.length > 0) // Remove empty lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();

    return formatted;
  }

  // Enhanced method specifically for formatting FDA API text with better structure
  formatFDAMedicationText(text, type = 'general') {
    if (!text) return text;
    
    // Remove common FDA formatting artifacts
    let formatted = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\(\s*\d+(?:\.\d+)?\s*\)/g, '') // Remove reference numbers like (6.1)
      .replace(/\[\s*see[^[\]]*\]/gi, '') // Remove "see" references
      .replace(/\s*\.\s*\(\s*\d+(?:\.\d+)?\s*\)/g, '.') // Clean up period + reference
      .trim();

    // Type-specific formatting
    switch (type) {
      case 'indications':
        formatted = this.formatIndicationsText(formatted);
        break;
      case 'adverse_reactions':
        formatted = this.formatAdverseReactionsText(formatted);
        break;
      case 'warnings':
        formatted = this.formatWarningsText(formatted);
        break;
    }

    // General cleanup for all types
    formatted = formatted
      // Fix section headers
      .replace(/^(\d+)\s+([A-Z\s]+)/g, '\n$2:\n') // Convert "6 ADVERSE REACTIONS" to "ADVERSE REACTIONS:"
      .replace(/^(\d+\.\d+)\s+([A-Z][^.]*)/g, '\n$2:\n') // Convert "6.1 Clinical" to "Clinical:"
      // Clean up spacing
      .replace(/\s*:\s*/g, ':\n') // Add newline after colons
      .replace(/\s*,\s*/g, ', ') // Clean up commas
      .replace(/\s*\.\s*/g, '. ') // Clean up periods
      // Handle contact information properly
      .replace(/contact\s+([^,]+)\s+at\s+([0-9-]+)/gi, 'Contact $1 at $2')
      .replace(/or\s+FDA\s+at\s+([0-9-]+)/gi, 'or FDA at $1')
      .replace(/or\s+(www\.[^\s]+)/gi, 'or visit $1');

    // Split into lines and clean each line
    const lines = formatted.split('\n');
    const cleanedLines = lines.map(line => {
      line = line.trim();
      
      // Skip empty lines
      if (!line) return '';
      
      // Capitalize section headers
      if (line.endsWith(':') && line.length < 50) {
        line = line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
        line = line.replace(/\b\w/g, l => l.toUpperCase()); // Title case
      } else if (line.length > 0) {
        // Capitalize first letter of regular lines
        line = line.charAt(0).toUpperCase() + line.slice(1);
      }
      
      return line;
    });

    // Rejoin and final cleanup
    formatted = cleanedLines
      .filter(line => line.length > 0) // Remove empty lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();

    return formatted;
  }

  // Format indications/usage text specifically
  formatIndicationsText(text) {
    // Look for common indication patterns
    text = text
      .replace(/is indicated for/gi, 'is indicated for:')
      .replace(/used to treat/gi, 'used to treat:')
      .replace(/treatment of/gi, 'treatment of:')
      .replace(/indicated in/gi, 'indicated for:');

    // Extract key usage information
    const usagePatterns = [
      /(?:indicated for|used to treat|treatment of):?\s*([^.]+)/gi,
      /is a[^.]*indicated for\s+([^.]+)/gi,
      /used in the treatment of\s+([^.]+)/gi
    ];

    let mainUsage = '';
    for (const pattern of usagePatterns) {
      const match = text.match(pattern);
      if (match && match[0].length > mainUsage.length) {
        mainUsage = match[0];
        break;
      }
    }

    if (mainUsage) {
      text = `INDICATED FOR:\n${mainUsage.replace(/^[^:]*:?\s*/i, '').trim()}\n\n${text}`;
    }

    return text;
  }

  // Format adverse reactions text specifically
  formatAdverseReactionsText(text) {
    // Handle the specific format like your example
    text = text
      // Clean up the common reactions part
      .replace(/Most common adverse reactions reported at an incidence ≥(\d+)% are\s*/gi, 'Most Common Side Effects (≥$1% incidence):\n• ')
      .replace(/,\s*and\s+/gi, '\n• ')
      .replace(/,\s+/g, '\n• ')
      // Format contact information better
      .replace(/To report SUSPECTED ADVERSE REACTIONS,?\s*/gi, '\n\nTo Report Side Effects:\n')
      .replace(/contact\s+([^,]+)\s+at\s+([0-9-]+)/gi, '• Contact $1: $2')
      .replace(/or\s+FDA\s+at\s+([0-9-]+)/gi, '\n• FDA: $1')
      .replace(/or\s+(www\.[^\s]+)/gi, '\n• Online: $1');

    // Clean up clinical trials section
    text = text
      .replace(/Clinical Trials Experience\s*/gi, '\n\nClinical Trials Experience:\n')
      .replace(/Because clinical trials are conducted under widely varying conditions,?\s*/gi, 'Note: Clinical trial results may vary due to different study conditions. ');

    return text;
  }

  // Format warnings text specifically
  formatWarningsText(text) {
    // Handle contraindications
    text = text
      .replace(/CONTRAINDICATIONS\s*/gi, 'CONTRAINDICATIONS:\n')
      .replace(/is contraindicated in/gi, 'This medication should not be used in:')
      .replace(/may cause fetal harm/gi, 'may cause harm to unborn babies')
      // Format pregnancy warnings
      .replace(/contraindicated in pregnancy/gi, 'not safe during pregnancy')
      .replace(/If this drug is used during pregnancy,?\s*/gi, '\n\nImportant: If used during pregnancy, ')
      .replace(/treatment should be discontinued/gi, 'stop treatment immediately')
      .replace(/patient apprised of the potential haza/gi, 'inform patient of potential hazards');

    return text;
  }

  // New method to extract specific usage information from FDA text
  extractSpecificUsageInfo(text) {
    // Enhanced patterns to find specific usage/treatment information
    const usagePatterns = [
      // Direct indication statements
      /(?:is indicated for|indicated for the treatment of)\s*([^.]+)/gi,
      // Used to treat patterns
      /(?:used to treat|treatment of|therapy for)\s*([^.]+)/gi,
      // Management patterns
      /(?:management of|prescribed for)\s*([^.]+)/gi,
      // Relief patterns
      /(?:relief of|relieves)\s*([^.]+)/gi,
      // Prevention patterns
      /(?:prevention of|prevents)\s*([^.]+)/gi
    ];

    let bestUsage = '';
    let highestScore = 0;

    for (const pattern of usagePatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        if (match[1]) {
          // Score based on length and medical relevance
          const usage = match[1].trim();
          const score = usage.length + (usage.match(/\b(?:infection|pain|inflammation|disease|disorder|condition|syndrome)\b/gi) || []).length * 10;
          
          if (score > highestScore) {
            highestScore = score;
            bestUsage = usage;
          }
        }
      }
    }

    return bestUsage;
  }

  extractComprehensiveUsage(fdaResult) {
    // Look for comprehensive usage information across multiple fields
    const fields = ['indications_and_usage', 'description', 'purpose'];
    let comprehensiveUsage = '';

    for (const field of fields) {
      if (fdaResult[field] && fdaResult[field].length > 0) {
        const text = fdaResult[field][0];
        const usage = this.extractSpecificUsageInfo(text);
        if (usage && usage.length > comprehensiveUsage.length) {
          comprehensiveUsage = usage;
        }
      }
    }

    return comprehensiveUsage;
  }

  extractContextualInfo(extractedText, medicationName) {
    const context = {
      dosages: this.extractDosagesFromText(extractedText),
      schedule: this.extractScheduleFromText(extractedText),
      instructions: this.extractInstructionsFromText(extractedText)
    };

    // Remove empty values
    Object.keys(context).forEach(key => {
      if (!context[key] || (Array.isArray(context[key]) && context[key].length === 0)) {
        delete context[key];
      }
    });

    return Object.keys(context).length > 0 ? context : null;
  }

  extractDosagesFromText(text) {
    const dosageMatches = text.match(this.medicationPatterns.dosage) || [];
    return [...new Set(dosageMatches)]; // Remove duplicates
  }

  extractScheduleFromText(text) {
    const scheduleMatches = text.match(this.medicationPatterns.schedule) || [];
    return scheduleMatches.length > 0 ? scheduleMatches.join(', ') : null;
  }

  extractInstructionsFromText(text) {
    const instructionPatterns = [
      /take\s+[^.]+/gi,
      /swallow\s+[^.]+/gi,
      /with\s+(?:food|meals|water)[^.]+/gi,
      /do not\s+[^.]+/gi
    ];

    const instructions = [];
    for (const pattern of instructionPatterns) {
      const matches = text.match(pattern) || [];
      instructions.push(...matches);
    }

    return instructions.length > 0 ? [...new Set(instructions)] : null;
  }

  /**
   * Enhanced AI chatbot fallback for medication information
   * This serves as a comprehensive fallback database when FDA/online sources fail
   */
  async getAIChatbotMedicationInfo(medicationName) {
    try {
      if (!this.openai) {
        console.log('⚠️  OpenAI API not available - missing API key or running in test mode');
        return null;
      }

      console.log(`🤖 Using OpenAI as fallback database for medication: "${medicationName}"`);

      const prompt = `You are a comprehensive medical database assistant with extensive knowledge of FDA-approved medications, pharmaceuticals, and medical treatments. Your role is to serve as a reliable fallback when primary medication databases are unavailable.

MEDICATION TO ANALYZE: "${medicationName}"

CRITICAL REQUIREMENTS:
- Only provide information for legitimate, real medications (FDA-approved drugs, generic medications, common OTC drugs)
- If this is not a recognized medication name, brand name, or generic drug, return exactly: {"error": "medication_not_found"}
- If it's a misspelling of a real medication, provide information for the correct medication and note the correction
- Be comprehensive and medically accurate with specific, detailed side effects and warnings
- Include safety warnings and medical disclaimers
- Use professional medical terminology

SPECIAL FOCUS ON SIDE EFFECTS AND WARNINGS:
- For sideEffects: Provide specific, organized list including common (>10%), less common (1-10%), and rare (<1%) side effects. Include both mild and serious reactions.
- For warnings: Include specific contraindications, drug interactions, pregnancy category, age restrictions, liver/kidney considerations, and monitoring requirements.
- Be medication-specific, not generic. Reference actual documented adverse events and precautions for this exact medication.

RESPONSE FORMAT (JSON only):
{
  "name": "${medicationName}",
  "genericName": "official generic/chemical name",
  "brandNames": ["array", "of", "common", "brand", "names"],
  "usedFor": "comprehensive description of medical uses, indications, and conditions treated (2-3 sentences)",
  "sideEffects": "DETAILED medication-specific side effects organized by frequency: Common (>10%): [list specific effects]. Less common (1-10%): [list specific effects]. Rare (<1%): [list serious/severe effects]. Contact healthcare provider immediately for: [emergency symptoms]",
  "warnings": "SPECIFIC warnings for this medication including: Contraindications (do not use if...), Drug interactions (avoid with...), Pregnancy/breastfeeding considerations, Age restrictions, Liver/kidney warnings, Storage requirements, Signs to watch for that require immediate medical attention",
  "dosageInfo": "general dosage forms available (tablets, capsules, liquid) and typical adult dosing guidelines",
  "drugClass": "pharmacological classification (e.g., 'ACE inhibitor', 'NSAID', 'antibiotic')",
  "mechanism": "brief explanation of how the medication works in the body",
  "monitoring": "what should be monitored during treatment (labs, symptoms, etc.)",
  "correctedName": "if the input was a misspelling, provide the correct medication name here, otherwise null"
}

EXAMPLE FORMAT FOR SIDE EFFECTS:
"Common (>10%): Nausea, headache, dizziness. Less common (1-10%): Stomach upset, drowsiness, dry mouth. Rare (<1%): Severe allergic reaction, liver problems, heart rhythm changes. Contact healthcare provider immediately for: Difficulty breathing, severe rash, yellowing of skin/eyes, irregular heartbeat."

EXAMPLE FORMAT FOR WARNINGS:
"Contraindications: Do not use if allergic to [drug class], pregnant, have severe liver disease. Drug interactions: Avoid alcohol, blood thinners (warfarin), certain antibiotics. Pregnancy: Category C - use only if benefits outweigh risks. Children: Not recommended under age 12. Liver/kidney: Dose adjustment needed in impaired function. Storage: Keep in cool, dry place. Seek immediate medical attention for: [specific emergency symptoms]."

IMPORTANT NOTES:
- If unsure about any field, indicate "Consult healthcare provider" rather than guessing
- Always include appropriate medical disclaimers
- For controlled substances, emphasize prescription requirements
- Be especially careful with dosage information - provide ranges, not specific doses

Analyze: "${medicationName}"

Respond with JSON only, no additional text:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a comprehensive medication database assistant providing accurate, evidence-based pharmaceutical information. You serve as a reliable fallback when primary medical databases are unavailable. Your responses must include detailed, medication-specific side effects organized by frequency and comprehensive warnings with specific contraindications and safety precautions. Always emphasize consulting healthcare providers for medical decisions and include appropriate safety disclaimers. Focus on providing actionable, specific information rather than generic statements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.1 // Low temperature for consistent, factual responses
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        console.log('No response from AI Assistant');
        return null;
      }

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(response);
        
        // Check if medication is not recognized
        if (parsed.error === "medication_not_found") {
          console.log(`🚫 OpenAI: "${medicationName}" is not a recognized medication`);
          return null;
        }
        
        // Validate the response structure
        if (!parsed.genericName && !parsed.usedFor) {
          console.log('⚠️  OpenAI response lacks essential medication information');
          return null;
        }

        // Calculate confidence based on completeness of AI response
        const aiConfidence = this.calculateAIResponseConfidence(parsed);

        // Format the AI response to match our structure
        const aiResult = {
          name: parsed.correctedName || medicationName, // Use corrected name if provided
          originalSearchTerm: medicationName,
          genericName: parsed.genericName || medicationName,
          brandNames: Array.isArray(parsed.brandNames) ? parsed.brandNames : [parsed.brandNames || medicationName],
          usedFor: this.formatAIUsage(parsed.usedFor),
          sideEffects: this.formatAISideEffects(parsed.sideEffects),
          warnings: this.formatAIWarnings(parsed.warnings),
          strength: parsed.dosageInfo || 'Consult prescription label or healthcare provider',
          drugClass: parsed.drugClass || 'Contact healthcare provider for classification',
          mechanism: parsed.mechanism || 'Consult healthcare provider for mechanism of action',
          monitoring: parsed.monitoring || 'Follow healthcare provider instructions for monitoring',
          confidence: aiConfidence,
          source: 'OpenAI_Database',
          dataSource: 'ai_fallback_database',
          searchedAt: new Date().toISOString(),
          note: 'Information provided by OpenAI as fallback database when FDA/primary sources were unavailable. Please verify with healthcare provider and current prescribing information.',
          correctionApplied: parsed.correctedName ? `Original search: "${medicationName}" → Corrected to: "${parsed.correctedName}"` : null
        };

        console.log(`✅ OpenAI fallback database provided comprehensive information for "${medicationName}" with confidence ${aiConfidence}`);
        console.log('📋 Enhanced side effects provided:', parsed.sideEffects ? 'Yes' : 'No');
        console.log('⚠️ Enhanced warnings provided:', parsed.warnings ? 'Yes' : 'No');
        if (parsed.correctedName) {
          console.log(`📝 OpenAI corrected medication name: "${medicationName}" → "${parsed.correctedName}"`);
        }
        return aiResult;

      } catch (parseError) {
        console.error('🔧 Failed to parse OpenAI response as JSON:', parseError);
        console.log('📄 Raw OpenAI response:', response.substring(0, 200) + '...');
        return null;
      }

    } catch (error) {
      console.error('🚨 OpenAI fallback database error:', error.message);
      if (error.status === 429) {
        console.log('⏱️  OpenAI rate limit exceeded - try again later');
      } else if (error.status === 401) {
        console.log('🔑 OpenAI API key authentication failed');
      }
      return null;
    }
  }

  /**
   * Calculate confidence based on AI response completeness
   */
  calculateAIResponseConfidence(aiResponse) {
    let confidence = 0.4; // Base confidence for AI responses
    
    // Award points for comprehensive information
    if (aiResponse.genericName && aiResponse.genericName.length > 2) confidence += 0.1;
    if (aiResponse.brandNames && Array.isArray(aiResponse.brandNames) && aiResponse.brandNames.length > 0) confidence += 0.05;
    if (aiResponse.usedFor && aiResponse.usedFor.length > 20) confidence += 0.15;
    
    // Enhanced scoring for detailed side effects
    if (aiResponse.sideEffects) {
      if (aiResponse.sideEffects.length > 100 && aiResponse.sideEffects.includes('Common')) confidence += 0.15; // Detailed, organized side effects
      else if (aiResponse.sideEffects.length > 50) confidence += 0.1; // Good side effects info
      else if (aiResponse.sideEffects.length > 20) confidence += 0.05; // Basic side effects
    }
    
    // Enhanced scoring for detailed warnings
    if (aiResponse.warnings) {
      if (aiResponse.warnings.length > 100 && aiResponse.warnings.includes('Contraindications')) confidence += 0.15; // Detailed, specific warnings
      else if (aiResponse.warnings.length > 50) confidence += 0.1; // Good warnings info
      else if (aiResponse.warnings.length > 15) confidence += 0.05; // Basic warnings
    }
    
    if (aiResponse.drugClass && aiResponse.drugClass.length > 5) confidence += 0.05;
    if (aiResponse.mechanism && aiResponse.mechanism.length > 10) confidence += 0.05;
    
    // Bonus for medication name correction (shows AI understanding)
    if (aiResponse.correctedName) confidence += 0.05;
    
    // Cap the maximum confidence for AI-generated content but allow higher scores for comprehensive responses
    return Math.min(confidence, 0.85);
  }

  /**
   * Analyze OCR text for potential medications using AI
   */
  async analyzeTextForMedications(extractedText) {
    try {
      if (!this.openai) {
        console.log('OpenAI not available for text analysis');
        return null;
      }

      console.log('Analyzing OCR text for medications using AI...');

      const prompt = `You are a medication recognition specialist. Analyze the following OCR text extracted from a medication label/prescription and identify any medications mentioned.

OCR Text to analyze:
"${extractedText}"

INSTRUCTIONS:
- Look for medication names (brand names, generic names, active ingredients)
- Ignore dosage numbers, instructions, and non-medication text
- Only identify real, legitimate medications
- If no clear medications are found, return {"medications": []}
- Be conservative - only suggest medications you're confident about

Response format (JSON only):
{
  "medications": [
    {
      "name": "identified medication name",
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation of why this was identified"
    }
  ]
}

Respond only with the JSON object, no additional text.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a specialized medication recognition AI that analyzes OCR text to identify medications. You are conservative and only suggest medications when confident."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        console.log('No response from AI text analysis');
        return null;
      }

      try {
        const parsed = JSON.parse(response);
        
        if (parsed.medications && Array.isArray(parsed.medications)) {
          // For each identified medication, get full information
          const enhancedMedications = [];
          
          for (const med of parsed.medications.slice(0, 2)) {
            if (med.confidence > 0.3) {
              const fullInfo = await this.getAIChatbotMedicationInfo(med.name);
              if (fullInfo) {
                enhancedMedications.push({
                  ...fullInfo,
                  confidence: Math.min(med.confidence * fullInfo.confidence, 0.6),
                  aiReasoning: med.reasoning
                });
              }
            }
          }
          
          return { medications: enhancedMedications };
        }
      } catch (parseError) {
        console.error('Failed to parse AI text analysis response:', parseError);
      }

      return null;
    } catch (error) {
      console.error('Error in AI text analysis:', error);
      return null;
    }
  }

  /**
   * Format AI-generated usage information
   */
  formatAIUsage(text) {
    if (!text) return null;
    
    let formatted = text;
    
    // Add medical disclaimer
    if (!formatted.toLowerCase().includes('consult') && !formatted.toLowerCase().includes('healthcare provider')) {
      formatted += '\n\nImportant: Always consult your healthcare provider for proper medical guidance and treatment decisions.';
    }
    
    return this.formatMedicationText(formatted);
  }

  /**
   * Format AI-generated side effects information
   */
  formatAISideEffects(text) {
    if (!text) return 'Consult healthcare provider for side effects information and report any unusual symptoms immediately.';
    
    let formatted = text;
    
    // Clean up and format the side effects text for better readability
    formatted = formatted
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/Common \(>10%\):/gi, '\n📋 Common (>10%):')
      .replace(/Less common \(1-10%\):/gi, '\n⚠️ Less common (1-10%):')
      .replace(/Rare \(<1%\):/gi, '\n🚨 Rare (<1%):')
      .replace(/Contact healthcare provider immediately for:/gi, '\n🆘 Contact healthcare provider immediately for:')
      .replace(/Seek immediate medical attention for:/gi, '\n🆘 Seek immediate medical attention for:')
      .trim();

    // Add structured reporting guidance if not already present
    if (!formatted.toLowerCase().includes('contact healthcare provider') && 
        !formatted.toLowerCase().includes('report') && 
        !formatted.toLowerCase().includes('medical attention')) {
      formatted += '\n\n🆘 Contact healthcare provider immediately for any severe or unusual symptoms.';
    }
    
    // Ensure proper formatting and add medical disclaimer
    if (!formatted.toLowerCase().includes('this list may not be complete')) {
      formatted += '\n\nNote: This list may not be complete. Always report any side effects to your healthcare provider.';
    }
    
    return this.formatAdverseReactionsText(formatted);
  }

  /**
   * Format AI-generated warnings information
   */
  formatAIWarnings(text) {
    if (!text) return 'Follow healthcare provider instructions. Contact healthcare provider with any questions or concerns about this medication.';
    
    let formatted = text;
    
    // Clean up and format the warnings text with clear sections
    formatted = formatted
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/Contraindications:/gi, '\n🚫 Contraindications:')
      .replace(/Drug interactions:/gi, '\n💊 Drug interactions:')
      .replace(/Pregnancy\/breastfeeding:/gi, '\n🤱 Pregnancy/breastfeeding:')
      .replace(/Pregnancy:/gi, '\n🤱 Pregnancy:')
      .replace(/Breastfeeding:/gi, '\n🤱 Breastfeeding:')
      .replace(/Age restrictions:/gi, '\n👶 Age restrictions:')
      .replace(/Children:/gi, '\n👶 Children:')
      .replace(/Liver\/kidney:/gi, '\n🫘 Liver/kidney:')
      .replace(/Storage:/gi, '\n📦 Storage:')
      .replace(/Storage requirements:/gi, '\n📦 Storage requirements:')
      .replace(/Seek immediate medical attention for:/gi, '\n🆘 Seek immediate medical attention for:')
      .replace(/Signs to watch for:/gi, '\n👀 Signs to watch for:')
      .trim();

    // Add general safety reminder if not already present
    if (!formatted.toLowerCase().includes('healthcare provider') && 
        !formatted.toLowerCase().includes('doctor') && 
        !formatted.toLowerCase().includes('physician')) {
      formatted += '\n\n⚠️ Always consult your healthcare provider before starting, stopping, or changing this medication.';
    }
    
    // Add emergency contact reminder
    if (!formatted.toLowerCase().includes('emergency') && 
        !formatted.toLowerCase().includes('immediate medical attention')) {
      formatted += '\n\n🆘 Seek immediate medical attention for severe reactions or if you have concerns about your symptoms.';
    }

    return this.formatWarningsText(formatted);
  }

  getDefaultMedicationInfo(medicationName) {
    return {
      name: medicationName,
      genericName: 'Information not available',
      brandNames: ['Please consult healthcare provider'],
      strength: 'Consult prescription label or healthcare provider',
      usedFor: `Information for "${medicationName}" could not be found in FDA databases or OpenAI fallback database. This may indicate: (1) an uncommon or specialty medication, (2) a misspelled medication name, (3) a non-medication item, or (4) temporary database unavailability. Please consult your healthcare provider for accurate medication information.`,
      sideEffects: 'Please consult your healthcare provider for potential side effects and report any unusual symptoms immediately. Refer to medication packaging or prescription information provided by your pharmacy.',
      warnings: 'Follow your healthcare provider\'s instructions exactly. Take only as prescribed. Do not share with others. Contact your healthcare provider immediately if you have questions or concerns about this medication.',
      dosageForm: 'Consult prescription label',
      schedule: 'Follow prescription instructions exactly',
      confidence: 0.1,
      source: 'fallback_system',
      dataSource: 'no_data_found',
      searchedAt: new Date().toISOString(),
      note: 'No information found in FDA databases or OpenAI fallback database. Database search attempted: FDA Drug Labels, OpenFDA, NIH MedlinePlus, RxNav, and OpenAI knowledge base. Please verify medication details with healthcare provider.'
    };
  }
}

export default MedicationInfoService;
