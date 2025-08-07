import express from 'express';
import mongoose from 'mongoose';
import { CareRecipient } from '../models/index.js';
import constants from '../utils/constants.js';

const router = express.Router();

/**
 * Get all care recipients for a user
 */
router.get('/care-recipients/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const careRecipients = await CareRecipient.find({ 
      userId, 
      isActive: true 
    }).select('name dateOfBirth medicalConditions emergencyContact notes createdAt');
    
    res.json({
      success: true,
      careRecipients
    });
  } catch (error) {
    console.error('Error fetching care recipients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch care recipients',
      details: error.message
    });
  }
});

/**
 * Create a new care recipient (Scanner database)
 */
router.post('/care-recipients', async (req, res) => {
  try {
    const { name, dateOfBirth, medicalConditions, emergencyContact, notes } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Care recipient name is required'
      });
    }
    
    console.log('Creating new care recipient:', name);
    
    // Create a default user ObjectId for Scanner-created care recipients
    const defaultUserId = new mongoose.Types.ObjectId(constants.DEFAULT_USER_ID);
    
    const careRecipientData = {
      name: name.trim(),
      userId: defaultUserId,
      dateOfBirth,
      medicalConditions: medicalConditions || [],
      emergencyContact,
      notes: notes || '',
      isActive: true
    };
    
    const newCareRecipient = new CareRecipient(careRecipientData);
    await newCareRecipient.save();
    
    console.log('Care recipient created successfully:', newCareRecipient._id);
    
    res.status(201).json({
      success: true,
      data: {
        id: newCareRecipient._id,
        _id: newCareRecipient._id,
        name: newCareRecipient.name,
        userId: newCareRecipient.userId,
        dateOfBirth: newCareRecipient.dateOfBirth,
        medicalConditions: newCareRecipient.medicalConditions,
        emergencyContact: newCareRecipient.emergencyContact,
        notes: newCareRecipient.notes,
        createdAt: newCareRecipient.createdAt,
        updatedAt: newCareRecipient.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating care recipient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create care recipient',
      details: error.message
    });
  }
});

/**
 * Get all care recipients (Scanner database)
 */
router.get('/care-recipients', async (req, res) => {
  try {
    console.log('Getting all care recipients from Scanner database...');
    
    const careRecipients = await CareRecipient.find({ isActive: true }).sort({ createdAt: -1 });
    
    console.log(`Found ${careRecipients.length} care recipients`);
    
    const formattedRecipients = careRecipients.map(recipient => ({
      _id: recipient._id,
      name: recipient.name,
      userId: recipient.userId,
      dateOfBirth: recipient.dateOfBirth,
      medicalConditions: recipient.medicalConditions,
      emergencyContact: recipient.emergencyContact,
      notes: recipient.notes,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt
    }));
    
    res.json(formattedRecipients);
  } catch (error) {
    console.error('Error getting care recipients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get care recipients',
      details: error.message
    });
  }
});

/**
 * Delete a care recipient and all their medications
 */
router.delete('/care-recipients/:careRecipientId', async (req, res) => {
  try {
    const { careRecipientId } = req.params;
    const { Medication } = await import('../models/index.js');
    
    console.log(`=== DELETE CARE RECIPIENT REQUEST ===`);
    console.log('Care Recipient ID:', careRecipientId);
    
    // First, delete all medications for this care recipient
    const deletedMedications = await Medication.deleteMany({ careRecipientId });
    console.log(`Deleted ${deletedMedications.deletedCount} medications for care recipient`);
    
    // Then delete the care recipient
    const deletedCareRecipient = await CareRecipient.findByIdAndDelete(careRecipientId);
    
    if (!deletedCareRecipient) {
      return res.status(404).json({
        success: false,
        error: 'Care recipient not found'
      });
    }
    
    console.log(`Care recipient deleted: ${deletedCareRecipient.name}`);
    
    res.json({
      success: true,
      message: 'Care recipient and all medications deleted successfully',
      deletedCareRecipient: {
        id: deletedCareRecipient._id,
        name: deletedCareRecipient.name
      },
      deletedMedicationsCount: deletedMedications.deletedCount
    });
  } catch (error) {
    console.error('Error deleting care recipient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete care recipient',
      details: error.message
    });
  }
});

export default router;
