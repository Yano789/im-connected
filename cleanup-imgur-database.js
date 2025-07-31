import mongoose from 'mongoose';

// Use the same connection string as the application
const MONGODB_URI = 'mongodb+srv://sean2002tan:LCtOQzaNYmfM39Io@cluster0.xk41oxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define the medication schema (matching the Forum backend)
const medicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    careRecipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    image: { type: String, default: '' },
    usedTo: { type: String, default: '' },
    sideEffects: { type: String, default: '' },
    warnings: { type: String, default: '' },
    dosage: { type: String, default: '' },
    schedule: { type: String, default: '' },
    dosages: [{}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Medication = mongoose.model('Medication', medicationSchema);

async function cleanupImgurUrls() {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB Atlas');
        
        // Find all medications with imgur URLs
        console.log('\n🔍 Searching for medications with imgur URLs...');
        const imgurMedications = await Medication.find({ 
            image: { $regex: /imgur\.com/i } 
        }).select('name username image createdAt');
        
        console.log(`📊 Found ${imgurMedications.length} medications with imgur URLs:`);
        
        if (imgurMedications.length > 0) {
            imgurMedications.forEach((med, index) => {
                console.log(`  ${index + 1}. ${med.name} (${med.username}) - ${med.image}`);
            });
            
            // Update all imgur URLs to empty strings
            console.log('\n🧹 Cleaning up imgur URLs...');
            const updateResult = await Medication.updateMany(
                { image: { $regex: /imgur\.com/i } },
                { image: '', updatedAt: new Date() }
            );
            
            console.log(`✅ Successfully updated ${updateResult.modifiedCount} medications`);
            console.log(`📝 Set image field to empty string for all medications with imgur URLs`);
        } else {
            console.log('✅ No medications with imgur URLs found - database is clean!');
        }
        
        // Verify the cleanup
        console.log('\n🔍 Verifying cleanup...');
        const remainingImgur = await Medication.countDocuments({ 
            image: { $regex: /imgur\.com/i } 
        });
        
        if (remainingImgur === 0) {
            console.log('✅ Cleanup successful - no imgur URLs remaining');
        } else {
            console.log(`⚠️  Warning: ${remainingImgur} medications still have imgur URLs`);
        }
        
        // Show some sample medications after cleanup
        console.log('\n📋 Sample medications after cleanup:');
        const sampleMeds = await Medication.find({})
            .select('name username image')
            .limit(5)
            .sort({ updatedAt: -1 });
            
        sampleMeds.forEach((med, index) => {
            const imageStatus = med.image ? `Image: ${med.image.substring(0, 50)}...` : 'No image';
            console.log(`  ${index + 1}. ${med.name} (${med.username}) - ${imageStatus}`);
        });
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB Atlas');
        console.log('🎉 Database cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupImgurUrls();
