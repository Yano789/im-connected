const mongoose = require('mongoose');

// Care Recipient Schema
const careRecipientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    dateOfBirth: {
        type: Date
    },
    medicalConditions: [{
        type: String,
        trim: true
    }],
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    notes: {
        type: String,
        maxlength: 1000
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Medication Schema
const medicationSchema = new mongoose.Schema({
    careRecipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CareRecipient',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    dosage: {
        type: String,
        trim: true,
        maxlength: 100
    },
    strength: {
        type: String,
        trim: true,
        maxlength: 50
    },
    schedule: {
        type: String,
        trim: true,
        maxlength: 200
    },
    dosages: [{
        period: {
            type: String,
            enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
            required: true
        },
        time: {
            type: String,
            required: true
        },
        taken: {
            type: Boolean,
            default: false
        },
        takenAt: {
            type: Date
        }
    }],
    usedTo: {
        type: String,
        trim: true,
        maxlength: 500
    },
    sideEffects: {
        type: String,
        trim: true,
        maxlength: 500
    },
    warnings: {
        type: String,
        trim: true,
        maxlength: 500
    },
    image: {
        url: String,
        publicId: String
    },
    prescriptionInfo: {
        doctorName: String,
        prescribedDate: Date,
        expiryDate: Date,
        pharmacyName: String,
        refillsRemaining: Number
    },
    scanData: {
        scannedText: String,
        confidence: Number,
        scanDate: Date,
        source: {
            type: String,
            enum: ['camera', 'upload', 'manual']
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Medication Log Schema for tracking when medications are taken
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    dosageIndex: {
        type: Number,
        required: true
    },
    taken: {
        type: Boolean,
        required: true
    },
    takenAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: 500
    },
    location: {
        type: String,
        maxlength: 100
    }
}, {
    timestamps: true
});

// Indexes for better performance
careRecipientSchema.index({ userId: 1, isActive: 1 });
medicationSchema.index({ careRecipientId: 1, isActive: 1 });
medicationSchema.index({ userId: 1, isActive: 1 });
medicationLogSchema.index({ medicationId: 1, createdAt: -1 });
medicationLogSchema.index({ careRecipientId: 1, createdAt: -1 });

// Middleware to update medication dosages when logged
medicationLogSchema.post('save', async function() {
    try {
        const medication = await mongoose.model('Medication').findById(this.medicationId);
        if (medication && medication.dosages[this.dosageIndex]) {
            medication.dosages[this.dosageIndex].taken = this.taken;
            medication.dosages[this.dosageIndex].takenAt = this.takenAt;
            await medication.save();
        }
    } catch (error) {
        console.error('Error updating medication dosage:', error);
    }
});

const CareRecipient = mongoose.model('CareRecipient', careRecipientSchema);
const Medication = mongoose.model('Medication', medicationSchema);
const MedicationLog = mongoose.model('MedicationLog', medicationLogSchema);

module.exports = {
    CareRecipient,
    Medication,
    MedicationLog
};
