import mongoose from 'mongoose';

// Connect to the same database
const MONGODB_URI = 'mongodb+srv://sean2002tan:LCtOQzaNYmfM39Io@cluster0.xk41oxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Import the medication model (simplified version)
const medicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    careRecipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    image: { type: String, default: '' },
    // ... other fields
}, { collection: 'medications' });

const Medication = mongoose.model('Medication', medicationSchema);

async function checkMedications() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Find all medications
        const medications = await Medication.find({});
        console.log(`Found ${medications.length} medications:`);
        
        medications.forEach((med, index) => {
            console.log(`${index + 1}. ${med.name} - Image: ${med.image || 'No image'}`);
        });
        
        // Find medications with imgur URLs
        const imguMedications = await Medication.find({ image: /imgur\.com/ });
        console.log(`\nFound ${imguMedications.length} medications with imgur URLs:`);
        
        imguMedications.forEach((med, index) => {
            console.log(`${index + 1}. ${med.name} - Image: ${med.image}`);
        });
        
        // Update imgur URLs to empty strings
        if (imguMedications.length > 0) {
            console.log('\nUpdating imgur URLs to empty strings...');
            const result = await Medication.updateMany(
                { image: /imgur\.com/ },
                { image: '' }
            );
            console.log(`Updated ${result.modifiedCount} medications`);
        }
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkMedications();
