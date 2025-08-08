const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Care Recipient Schema - linked to user
const CareRecipientSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, index: true }, // Links to User model
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Medication Schema - linked to care recipient and user
const MedicationSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, index: true }, // Links to User model
    careRecipientId: { type: Schema.Types.ObjectId, ref: 'CareRecipient', required: true },
    usedTo: { type: String, default: '' },
    sideEffects: { type: String, default: '' },
    dosage: { type: String, default: '' },
    schedule: { type: String, default: '' },
    warnings: { type: String, default: '' },
    image: { type: String, default: '' }, // GCS URL or base64
    dosages: [{
        time: { type: String, required: true },
        taken: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
CareRecipientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

MedicationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for better performance
CareRecipientSchema.index({ username: 1, name: 1 });
MedicationSchema.index({ username: 1, careRecipientId: 1 });
MedicationSchema.index({ username: 1, name: 1 });

const CareRecipient = mongoose.model("CareRecipient", CareRecipientSchema);
const Medication = mongoose.model("Medication", MedicationSchema);

module.exports = { CareRecipient, Medication };
