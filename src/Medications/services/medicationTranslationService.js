import i18next from 'i18next';

// Language mapping for Google Translate API
const languageMap = {
    'en': 'en',
    'ms': 'ms', 
    'ta': 'ta',
    'zh': 'zh'
};

class MedicationTranslationService {
    constructor() {
        this.baseUrl = 'http://localhost:5001/api/v1/lang'; // Forum API base URL (corrected path)
        this.cache = new Map(); // Simple cache to avoid re-translating same text
    }

    /**
     * Get current language from i18next
     */
    getCurrentLanguage() {
        return i18next.language || 'en';
    }

    /**
     * Get target language for Google Translate API
     */
    getTargetLanguage() {
        const currentLang = this.getCurrentLanguage();
        return languageMap[currentLang] || 'en';
    }

    /**
     * Check if translation is needed
     */
    shouldTranslate() {
        const currentLang = this.getCurrentLanguage();
        return currentLang !== 'en' && currentLang && this.isValidLanguage(currentLang);
    }

    /**
     * Check if language code is supported
     */
    isValidLanguage(lang) {
        return Object.keys(languageMap).includes(lang);
    }

    /**
     * Create cache key for text and language
     */
    getCacheKey(text, targetLang) {
        return `${targetLang}:${text}`;
    }

    /**
     * Translate a single text using the Forum's translation API
     */
    async translateText(text, targetLang = null) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return text;
        }

        const target = targetLang || this.getTargetLanguage();
        
        // Don't translate if target is English
        if (target === 'en') {
            return text;
        }

        // Check cache first
        const cacheKey = this.getCacheKey(text, target);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: text,
                    target: target
                })
            });

            if (!response.ok) {
                console.warn('MedicationTranslationService: Translation failed:', response.status, response.statusText);
                return text; // Return original text if translation fails
            }

            const data = await response.json();
            const translatedText = data.translated || text;
            
            // Cache the result
            this.cache.set(cacheKey, translatedText);
            
            return translatedText;
        } catch (error) {
            console.error('MedicationTranslationService: Translation error:', error);
            return text; // Return original text if translation fails
        }
    }

    /**
     * Translate medication object (excluding name)
     */
    async translateMedication(medication) {
        if (!medication || !this.shouldTranslate()) {
            return medication;
        }

        try {
            const targetLang = this.getTargetLanguage();
            
            // Create a copy to avoid mutating the original
            const translatedMedication = { ...medication };
            
            // Translate specific fields that contain user data (excluding name)
            const fieldsToTranslate = ['usedTo', 'sideEffects', 'warnings', 'dosage', 'schedule'];
            
            const translationPromises = fieldsToTranslate.map(async (field) => {
                if (translatedMedication[field] && translatedMedication[field].trim() !== '') {
                    const translated = await this.translateText(translatedMedication[field], targetLang);
                    translatedMedication[field] = translated;
                }
            });

            // Wait for all translations to complete
            await Promise.all(translationPromises);
            
            return translatedMedication;
        } catch (error) {
            console.error('MedicationTranslationService: Error translating medication:', error);
            return medication; // Return original if translation fails
        }
    }

    /**
     * Translate array of medications
     */
    async translateMedications(medications) {
        if (!medications || !Array.isArray(medications) || !this.shouldTranslate()) {
            return medications;
        }

        try {
            const translationPromises = medications.map(med => this.translateMedication(med));
            return await Promise.all(translationPromises);
        } catch (error) {
            console.error('Error translating medications array:', error);
            return medications;
        }
    }

    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Check if translation service is available
     */
    async checkTranslationService() {
        try {
            const response = await fetch(`${this.baseUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: 'test',
                    target: 'zh'
                })
            });
            
            return response.ok;
        } catch (error) {
            console.error('MedicationTranslationService: Service check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
const medicationTranslationService = new MedicationTranslationService();
export default medicationTranslationService;
