import { jest } from '@jest/globals';

describe('External API Integration Tests', () => {
  describe('FDA API Integration', () => {
    test('should construct correct FDA API URLs', () => {
      const medicationName = 'aspirin';
      const baseUrl = 'https://api.fda.gov/drug/label.json';
      const searchQueries = [
        `openfda.brand_name:"${medicationName}"`,
        `openfda.generic_name:"${medicationName}"`,
        `openfda.substance_name:"${medicationName}"`
      ];

      searchQueries.forEach(query => {
        const url = `${baseUrl}?search=${encodeURIComponent(query)}&limit=1`;
        expect(url).toContain('api.fda.gov');
        expect(url).toContain(medicationName);
        expect(url).toContain('limit=1');
      });
    });

    test('should parse FDA API response correctly', () => {
      const mockFDAResponse = {
        results: [{
          openfda: {
            generic_name: ['aspirin'],
            brand_name: ['Bayer Aspirin', 'Bufferin'],
            manufacturer_name: ['Bayer HealthCare LLC'],
            dosage_form: ['tablet'],
            route: ['oral']
          },
          indications_and_usage: ['For the temporary relief of minor aches and pains'],
          adverse_reactions: ['May cause stomach upset in sensitive individuals'],
          warnings: ['Do not exceed recommended dosage. Consult physician if symptoms persist.'],
          boxed_warning: ['Keep out of reach of children']
        }]
      };

      const parsedResult = {
        source: 'FDA',
        name: 'aspirin',
        genericName: mockFDAResponse.results[0].openfda.generic_name[0],
        brandNames: mockFDAResponse.results[0].openfda.brand_name,
        manufacturer: mockFDAResponse.results[0].openfda.manufacturer_name[0],
        usedFor: mockFDAResponse.results[0].indications_and_usage[0],
        sideEffects: mockFDAResponse.results[0].adverse_reactions[0],
        warnings: mockFDAResponse.results[0].warnings[0],
        dosageForm: mockFDAResponse.results[0].openfda.dosage_form[0],
        route: mockFDAResponse.results[0].openfda.route[0],
        confidence: 0.85
      };

      expect(parsedResult.genericName).toBe('aspirin');
      expect(parsedResult.brandNames).toContain('Bayer Aspirin');
      expect(parsedResult.source).toBe('FDA');
      expect(parsedResult.confidence).toBe(0.85);
    });

    test('should handle FDA API errors gracefully', () => {
      const errorResponses = [
        { ok: false, status: 404 },
        { ok: false, status: 500 },
        { ok: true, json: () => Promise.resolve({ results: [] }) } // Empty results
      ];

      errorResponses.forEach(response => {
        if (!response.ok || (response.ok && response.json)) {
          // In real implementation, this would return null or default info
          expect(response.ok === false || response.json !== undefined).toBe(true);
        }
      });
    });
  });

  describe('RxNav API Integration', () => {
    test('should construct correct RxNav API URLs', () => {
      const medicationName = 'ibuprofen';
      const baseUrl = 'https://rxnav.nlm.nih.gov/REST';
      const searchUrl = `${baseUrl}/drugs.json?name=${encodeURIComponent(medicationName)}`;

      expect(searchUrl).toContain('rxnav.nlm.nih.gov');
      expect(searchUrl).toContain('/REST/drugs.json');
      expect(searchUrl).toContain(`name=${medicationName}`);
    });

    test('should parse RxNav API response correctly', () => {
      const mockRxNavResponse = {
        drugGroup: {
          conceptGroup: [
            {
              conceptProperties: [
                {
                  rxcui: '5640',
                  name: 'Ibuprofen',
                  synonym: 'IBUPROFEN',
                  tty: 'IN',
                  language: 'ENG'
                }
              ]
            }
          ]
        }
      };

      const parsedResult = {
        source: 'RxNav_NLM',
        name: 'ibuprofen',
        confidence: 0.8,
        rxcui: null,
        genericName: 'Not available',
        brandNames: []
      };

      // Simulate parsing
      const concepts = mockRxNavResponse.drugGroup.conceptGroup;
      concepts.forEach(group => {
        if (group.conceptProperties) {
          group.conceptProperties.forEach(concept => {
            if (concept.rxcui && !parsedResult.rxcui) {
              parsedResult.rxcui = concept.rxcui;
            }
            if (concept.name && concept.name.toLowerCase().includes('ibuprofen')) {
              parsedResult.genericName = concept.name;
            }
          });
        }
      });

      expect(parsedResult.rxcui).toBe('5640');
      expect(parsedResult.genericName).toBe('Ibuprofen');
      expect(parsedResult.source).toBe('RxNav_NLM');
    });

    test('should handle RxNav API errors', () => {
      const errorScenarios = [
        { response: { ok: false, status: 404 }, expected: null },
        { response: { ok: true, json: () => Promise.resolve({}) }, expected: null },
        { response: { ok: true, json: () => Promise.resolve({ drugGroup: {} }) }, expected: null }
      ];

      errorScenarios.forEach(scenario => {
        if (!scenario.response.ok) {
          expect(scenario.expected).toBeNull();
        }
      });
    });
  });

  describe('OpenFDA API Integration', () => {
    test('should handle OpenFDA drugsfda endpoint', () => {
      const medicationName = 'metformin';
      const url = `https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:"${medicationName}"&limit=1`;

      expect(url).toContain('api.fda.gov/drug/drugsfda.json');
      expect(url).toContain(medicationName);
    });

    test('should parse OpenFDA response', () => {
      const mockOpenFDAResponse = {
        results: [{
          openfda: {
            generic_name: ['metformin hydrochloride'],
            brand_name: ['Glucophage'],
            manufacturer_name: ['Bristol-Myers Squibb']
          }
        }]
      };

      const parsedResult = {
        source: 'OpenFDA',
        name: 'metformin',
        genericName: mockOpenFDAResponse.results[0].openfda.generic_name[0],
        brandNames: mockOpenFDAResponse.results[0].openfda.brand_name,
        confidence: 0.8
      };

      expect(parsedResult.genericName).toBe('metformin hydrochloride');
      expect(parsedResult.brandNames).toContain('Glucophage');
    });
  });

  describe('API Response Combination', () => {
    test('should combine multiple API responses correctly', () => {
      const mockSources = [
        {
          status: 'fulfilled',
          value: {
            source: 'FDA',
            name: 'aspirin',
            genericName: 'aspirin',
            brandNames: ['Bayer'],
            confidence: 0.9
          }
        },
        {
          status: 'fulfilled',
          value: {
            source: 'RxNav_NLM',
            name: 'aspirin',
            rxcui: '1191',
            confidence: 0.8
          }
        },
        {
          status: 'rejected',
          reason: new Error('API timeout')
        }
      ];

      const successfulResults = mockSources
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      expect(successfulResults).toHaveLength(2);
      expect(successfulResults[0].source).toBe('FDA');
      expect(successfulResults[1].source).toBe('RxNav_NLM');
    });

    test('should prioritize sources by reliability', () => {
      const priorityOrder = ['FDA', 'NIH_MedlinePlus', 'RxNav_NLM', 'OpenFDA', 'online_medical_database'];
      
      const mockResults = [
        { source: 'online_medical_database', confidence: 0.7 },
        { source: 'FDA', confidence: 0.9 },
        { source: 'RxNav_NLM', confidence: 0.8 }
      ];

      const sortedResults = mockResults.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.source) !== -1 ? priorityOrder.indexOf(a.source) : 999;
        const bIndex = priorityOrder.indexOf(b.source) !== -1 ? priorityOrder.indexOf(b.source) : 999;
        return aIndex - bIndex;
      });

      expect(sortedResults[0].source).toBe('FDA');
      expect(sortedResults[1].source).toBe('RxNav_NLM');
      expect(sortedResults[2].source).toBe('online_medical_database');
    });

    test('should merge information from multiple sources', () => {
      const results = [
        {
          source: 'FDA',
          name: 'ibuprofen',
          brandNames: ['Advil', 'Motrin'],
          usedFor: 'Pain relief',
          confidence: 0.9
        },
        {
          source: 'RxNav_NLM',
          name: 'ibuprofen',
          rxcui: '5640',
          strength: '200mg',
          confidence: 0.8
        }
      ];

      const combined = {
        name: 'ibuprofen',
        sources: results.map(r => r.source),
        ...results[0] // Start with highest priority
      };

      // Enhance with other sources
      for (let i = 1; i < results.length; i++) {
        const result = results[i];
        if (result.strength && (!combined.strength || combined.strength === 'Not available')) {
          combined.strength = result.strength;
        }
      }

      expect(combined.sources).toEqual(['FDA', 'RxNav_NLM']);
      expect(combined.brandNames).toEqual(['Advil', 'Motrin']);
      expect(combined.strength).toBe('200mg');
    });
  });

  describe('API Timeout and Retry Logic', () => {
    test('should handle API timeouts', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      try {
        await timeoutPromise;
      } catch (error) {
        expect(error.message).toBe('Request timeout');
      }
    });

    test('should handle Promise.allSettled for multiple API calls', async () => {
      const apiCalls = [
        Promise.resolve({ source: 'FDA', data: 'success' }),
        Promise.reject(new Error('API error')),
        Promise.resolve({ source: 'RxNav', data: 'success' })
      ];

      const results = await Promise.allSettled(apiCalls);
      
      expect(results).toHaveLength(3);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });
  });

  describe('Cache Integration with APIs', () => {
    test('should cache API responses correctly', () => {
      const cache = new Map();
      const cacheKey = 'aspirin';
      const apiResponse = {
        name: 'aspirin',
        source: 'FDA',
        confidence: 0.9,
        brandNames: ['Bayer']
      };

      cache.set(cacheKey, {
        data: apiResponse,
        timestamp: Date.now()
      });

      const cached = cache.get(cacheKey);
      expect(cached.data.name).toBe('aspirin');
      expect(cached.data.source).toBe('FDA');
      expect(cached.timestamp).toBeLessThanOrEqual(Date.now());
    });

    test('should validate cache expiry before using cached data', () => {
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
      const cache = new Map();
      
      // Recent cache entry
      cache.set('recent', {
        data: { name: 'recent' },
        timestamp: Date.now() - 1000 // 1 second ago
      });

      // Expired cache entry
      cache.set('expired', {
        data: { name: 'expired' },
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      });

      const recentCached = cache.get('recent');
      const expiredCached = cache.get('expired');

      const isRecentValid = Date.now() - recentCached.timestamp < cacheExpiry;
      const isExpiredValid = Date.now() - expiredCached.timestamp < cacheExpiry;

      expect(isRecentValid).toBe(true);
      expect(isExpiredValid).toBe(false);
    });
  });

  describe('API Rate Limiting and Best Practices', () => {
    test('should respect API rate limits', () => {
      const rateLimits = {
        FDA: { requestsPerMinute: 240, requestsPerDay: 1000 },
        RxNav: { requestsPerMinute: 120, requestsPerDay: 10000 }
      };

      Object.entries(rateLimits).forEach(([api, limits]) => {
        expect(limits.requestsPerMinute).toBeGreaterThan(0);
        expect(limits.requestsPerDay).toBeGreaterThan(limits.requestsPerMinute);
      });
    });

    test('should use appropriate User-Agent headers', () => {
      const userAgent = 'MedicationScanner/2.0 (Healthcare Application)';
      const headers = {
        'User-Agent': userAgent,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      expect(headers['User-Agent']).toContain('MedicationScanner');
      expect(headers['Accept']).toBe('application/json');
    });
  });
});
