import mongoose from 'mongoose';

/**
 * Care Recipient Schema
 */
const careRecipientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Care recipient name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  medicalConditions: [{
    type: String,
    trim: true
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
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

// Index for efficient queries
careRecipientSchema.index({ userId: 1, isActive: 1 });
careRecipientSchema.index({ createdAt: -1 });

const CareRecipient = mongoose.model('CareRecipient', careRecipientSchema);

export default CareRecipient;
