import mongoose from 'mongoose';

/**
 * Medication Schema
 */
const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxlength: [200, 'Medication name cannot exceed 200 characters']
  },
  careRecipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareRecipient',
    required: true,
    index: true
  },
  dosage: {
    type: String,
    trim: true,
    maxlength: [100, 'Dosage cannot exceed 100 characters']
  },
  usedTo: {
    type: String,
    trim: true,
    maxlength: [2000, 'Usage description cannot exceed 2000 characters']
  },
  sideEffects: {
    type: String,
    trim: true,
    maxlength: [2000, 'Side effects description cannot exceed 2000 characters']
  },
  warnings: {
    type: String,
    trim: true,
    maxlength: [2000, 'Warnings cannot exceed 2000 characters']
  },
  schedule: {
    type: String,
    trim: true,
    maxlength: [200, 'Schedule cannot exceed 200 characters']
  },
  image: {
    url: String,
    publicId: String
  },
  dosages: [{
    type: String,
    trim: true
  }],
  scanData: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    extractedText: String,
    processingTime: Number,
    ocrMethod: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
medicationSchema.index({ careRecipientId: 1, isActive: 1 });
medicationSchema.index({ createdAt: -1 });
medicationSchema.index({ name: 'text' }); // Text search on name

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;
