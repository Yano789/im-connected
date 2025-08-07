#!/usr/bin/env node

/**
 * Test script to demonstrate enhanced OpenAI fallback database
 * for detailed medication side effects and warnings
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const SCANNER_API_URL = 'http://localhost:3001';

// Test medications that might trigger OpenAI fallback
const TEST_MEDICATIONS = [
  'Ichthammol',      // Specialty topical medication
  'Betamethasone',   // Topical corticosteroid
  'Mupirocin',       // Topical antibiotic
  'Hydroxyurea'      // Specialty oral medication
];

async function testOpenAIFallback(medicationName) {
  console.log(`\n🧪 Testing OpenAI fallback for: ${medicationName}`);
  console.log('='.repeat(60));
  
  try {
    // Create a simple FormData with minimal image and medication name
    const formData = new FormData();
    
    // Create a minimal test image file (1x1 pixel PNG)
    const imageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xCE, 0x0A, 0xFB, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    formData.append('image', imageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    // Add medication name as extracted text to trigger search
    formData.append('extractedText', medicationName);

    const response = await fetch(`${SCANNER_API_URL}/scan`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();
    
    if (result.success && result.medications && result.medications.length > 0) {
      const medication = result.medications[0];
      
      console.log(`✅ Medication found: ${medication.name}`);
      console.log(`📊 Confidence: ${Math.round(medication.confidence * 100)}%`);
      console.log(`🔍 Data Source: ${medication.dataSource}`);
      
      console.log('\n📋 SIDE EFFECTS:');
      console.log(medication.sideEffects || 'Not provided');
      
      console.log('\n⚠️ WARNINGS:');
      console.log(medication.warnings || 'Not provided');
      
      // Check if this is enhanced AI response
      if (medication.dataSource?.includes('ai') || medication.source === 'OpenAI_Database') {
        console.log('\n🤖 ENHANCED AI FALLBACK DETECTED!');
        
        // Check for enhanced formatting indicators
        const hasOrganizedSideEffects = medication.sideEffects?.includes('Common (') || 
                                       medication.sideEffects?.includes('📋');
        const hasStructuredWarnings = medication.warnings?.includes('Contraindications') || 
                                     medication.warnings?.includes('🚫');
        
        console.log(`📊 Organized side effects: ${hasOrganizedSideEffects ? '✅' : '❌'}`);
        console.log(`📋 Structured warnings: ${hasStructuredWarnings ? '✅' : '❌'}`);
      }
      
    } else {
      console.log('❌ No medication information found');
      if (result.error) {
        console.log('Error:', result.error);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${medicationName}:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Enhanced OpenAI Fallback Database Test');
  console.log('Testing medication scanning with enhanced AI fallback...\n');
  
  // Check if scanner service is available
  try {
    const healthResponse = await fetch(`${SCANNER_API_URL}/health`);
    const health = await healthResponse.json();
    console.log(`✅ Scanner service is healthy: ${health.service} v${health.version}`);
  } catch (error) {
    console.error('❌ Scanner service is not available:', error.message);
    console.log('Please ensure the scanner service is running on port 3001');
    return;
  }

  // Test each medication
  for (const medication of TEST_MEDICATIONS) {
    await testOpenAIFallback(medication);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
  }
  
  console.log('\n✅ Testing complete!');
  console.log('\nWhat to look for in enhanced results:');
  console.log('1. Side effects organized by frequency (Common, Less common, Rare)');
  console.log('2. Warnings with specific categories (Contraindications, Drug interactions, etc.)');
  console.log('3. Emoji indicators for better readability');
  console.log('4. Higher confidence scores for detailed responses');
  console.log('5. Emergency contact guidance included');
}

// Run the tests
runTests().catch(console.error);
