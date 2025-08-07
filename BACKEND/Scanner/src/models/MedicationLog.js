import mongoose from 'mongoose';

/**
 * Medication Log Schema
 */
const medicationLogSchema = new mongoose.Schema({
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
    index: true
  },
  careRecipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareRecipient',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['taken', 'missed', 'added', 'updated', 'deleted'],
    index: true
  },
  scheduledTime: Date,
  actualTime: Date,
  dosageTaken: String,
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  effectiveness: {
    type: Number,
    min: 1,
    max: 10
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
medicationLogSchema.index({ medicationId: 1, isActive: 1 });
medicationLogSchema.index({ careRecipientId: 1, isActive: 1 });
medicationLogSchema.index({ createdAt: -1 });
medicationLogSchema.index({ scheduledTime: 1 });

const MedicationLog = mongoose.model('MedicationLog', medicationLogSchema);

export default MedicationLog;
