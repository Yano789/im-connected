#!/usr/bin/env node

/**
 * Simple test script to verify database integration
 */
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const SCANNER_URL = 'http://localhost:3001';
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // Sample ObjectId
const TEST_CARE_RECIPIENT_NAME = 'Test Patient';

async function testDatabaseIntegration() {
  console.log('🧪 Testing Scanner Database Integration...\n');

  try {
    // 1. Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${SCANNER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // 2. Create a test care recipient
    console.log('\n2. Creating test care recipient...');
    const careRecipientResponse = await fetch(`${SCANNER_URL}/care-recipients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: TEST_CARE_RECIPIENT_NAME,
        userId: TEST_USER_ID,
        medicalConditions: ['Hypertension', 'Diabetes'],
        notes: 'Test patient for scanner integration'
      })
    });

    if (!careRecipientResponse.ok) {
      const errorText = await careRecipientResponse.text();
      console.log('❌ Failed to create care recipient:', errorText);
      return;
    }

    const careRecipientData = await careRecipientResponse.json();
    console.log('✅ Care recipient created:', careRecipientData.careRecipient.name);
    const careRecipientId = careRecipientData.careRecipient._id;

    // 3. Test getting care recipients for user
    console.log('\n3. Testing get care recipients...');
    const getCareRecipientsResponse = await fetch(`${SCANNER_URL}/care-recipients/${TEST_USER_ID}`);
    const getCareRecipientsData = await getCareRecipientsResponse.json();
    console.log('✅ Found care recipients:', getCareRecipientsData.careRecipients.length);

    // 4. Test getting medications for care recipient (should be empty initially)
    console.log('\n4. Testing get medications...');
    const getMedicationsResponse = await fetch(`${SCANNER_URL}/medications/${careRecipientId}`);
    const getMedicationsData = await getMedicationsResponse.json();
    console.log('✅ Initial medications count:', getMedicationsData.medications.length);

    console.log('\n🎉 Database integration test completed successfully!');
    console.log('\nTo test medication scanning:');
    console.log(`1. Use the care recipient ID: ${careRecipientId}`);
    console.log(`2. Send a POST request to ${SCANNER_URL}/save-scanned-medication`);
    console.log('3. Include an image file and the care recipient ID in the request');

  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
  }
}

// Run the test
testDatabaseIntegration();
