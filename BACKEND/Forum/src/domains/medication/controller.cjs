const { CareRecipient, Medication } = require("./model.cjs");
const User = require("../user/model.cjs");

// Care Recipients Controllers
const createCareRecipient = async (data) => {
    try {
        const { name, username } = data;
        console.log(`Creating care recipient for user: ${username}, name: ${name}`);
        
        // Verify user exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error("User does not exist");
        }

        // Check if care recipient already exists for this user
        const existingRecipient = await CareRecipient.findOne({ name, username });
        if (existingRecipient) {
            throw new Error("Care recipient with this name already exists");
        }

        const careRecipient = new CareRecipient({
            name,
            username
        });

        const savedRecipient = await careRecipient.save();
        console.log(`Successfully created care recipient for user: ${username}`);
        return savedRecipient;
    } catch (error) {
        throw error;
    }
};

const getCareRecipients = async (username) => {
    try {
        console.log(`Getting care recipients for user: ${username}`);
        
        // Verify user exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            console.log(`User not found: ${username}`);
            throw new Error("User does not exist");
        }
        console.log(`User found: ${existingUser.username} (ID: ${existingUser._id})`);

        const recipients = await CareRecipient.find({ username }).sort({ createdAt: -1 });
        console.log(`Found ${recipients.length} care recipients for user ${username}:`);
        recipients.forEach(r => console.log(`- ${r.name} (ID: ${r._id})`));
        
        return recipients;
    } catch (error) {
        throw error;
    }
};

const updateCareRecipient = async (data) => {
    try {
        const { id, name, username } = data;
        
        // Verify user exists and owns this recipient
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error("User does not exist");
        }

        const recipient = await CareRecipient.findOne({ _id: id, username });
        if (!recipient) {
            throw new Error("Care recipient not found or you don't have permission to update it");
        }

        recipient.name = name;
        const updatedRecipient = await recipient.save();
        return updatedRecipient;
    } catch (error) {
        throw error;
    }
};

const deleteCareRecipient = async (data) => {
    try {
        const { id, username } = data;
        
        // Verify user exists and owns this recipient
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error("User does not exist");
        }

        const recipient = await CareRecipient.findOne({ _id: id, username });
        if (!recipient) {
            throw new Error("Care recipient not found or you don't have permission to delete it");
        }

        // Delete all medications for this care recipient
        const deletedMedications = await Medication.deleteMany({ careRecipientId: id, username });
        
        // Delete the care recipient
        await CareRecipient.deleteOne({ _id: id, username });
        
        return {
            deletedRecipient: recipient,
            deletedMedicationsCount: deletedMedications.deletedCount
        };
    } catch (error) {
        throw error;
    }
};

// Medications Controllers
const createMedication = async (data) => {
    try {
        const { 
            name, 
            username, 
            careRecipientId, 
            usedTo = '', 
            sideEffects = '', 
            dosage = '', 
            schedule = '', 
            warnings = '', 
            image = '', 
            dosages = [] 
        } = data;
        
        console.log(`Creating medication for user: ${username}, medication: ${name}, care recipient: ${careRecipientId}`);
        
        // Verify user exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            console.log(`User not found: ${username}`);
            throw new Error("User does not exist");
        }
        console.log(`User found: ${existingUser.username}`);

        // Debug: Check what care recipients exist for this user
        const allUserRecipients = await CareRecipient.find({ username });
        console.log(`All care recipients for user ${username}:`, allUserRecipients.map(r => ({ id: r._id.toString(), name: r.name })));

        // Verify care recipient exists and belongs to user
        const careRecipient = await CareRecipient.findOne({ _id: careRecipientId, username });
        if (!careRecipient) {
            console.log(`Care recipient not found: ID ${careRecipientId} for user ${username}`);
            throw new Error("Care recipient not found or you don't have permission to add medications to it");
        }
        console.log(`Care recipient found: ${careRecipient.name} (ID: ${careRecipient._id})`);

        const medication = new Medication({
            name,
            username,
            careRecipientId,
            usedTo,
            sideEffects,
            dosage,
            schedule,
            warnings,
            image,
            dosages
        });

        const savedMedication = await medication.save();
        console.log(`Successfully created medication for user: ${username}`);
        return savedMedication;
    } catch (error) {
        throw error;
    }
};

const getMedications = async (username, careRecipientId = null) => {
    try {
        console.log(`Username passed to getMedications: ${username}${careRecipientId ? `, for care recipient: ${careRecipientId}` : ''}`);
        
        // Verify user exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error("User does not exist");
        }

        let query = { username };
        if (careRecipientId) {
            // Verify care recipient belongs to user
            const careRecipient = await CareRecipient.findOne({ _id: careRecipientId, username });
            if (!careRecipient) {
                throw new Error("Care recipient not found or you don't have permission to view its medications");
            }
            query.careRecipientId = careRecipientId;
        }

        const medications = await Medication.find(query)
            .populate('careRecipientId', 'name')
            .sort({ createdAt: -1 });
        console.log(`Found ${medications.length} medications for user: ${username}`);
        return medications;
    } catch (error) {
        throw error;
    }
};

const updateMedication = async (data) => {
    try {
        const { 
            id, 
            username, 
            name, 
            usedTo, 
            sideEffects, 
            dosage, 
            schedule, 
            warnings, 
            image, 
            dosages 
        } = data;
        
        // Verify user exists and owns this medication
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error("User does not exist");
        }

        const medication = await Medication.findOne({ _id: id, username });
        if (!medication) {
            throw new Error("Medication not found or you don't have permission to update it");
        }

        // Update fields
        if (name !== undefined) medication.name = name;
        if (usedTo !== undefined) medication.usedTo = usedTo;
        if (sideEffects !== undefined) medication.sideEffects = sideEffects;
        if (dosage !== undefined) medication.dosage = dosage;
        if (schedule !== undefined) medication.schedule = schedule;
        if (warnings !== undefined) medication.warnings = warnings;
        if (image !== undefined) medication.image = image;
        if (dosages !== undefined) medication.dosages = dosages;

        const updatedMedication = await medication.save();
        return updatedMedication;
    } catch (error) {
        throw error;
    }
};

const deleteMedication = async (data) => {
    try {
        const { id, username } = data;
        
        // Verify user exists and owns this medication
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error("User does not exist");
        }

        const medication = await Medication.findOne({ _id: id, username });
        if (!medication) {
            throw new Error("Medication not found or you don't have permission to delete it");
        }

        await Medication.deleteOne({ _id: id, username });
        return medication;
    } catch (error) {
        throw error;
    }
};

// Get all data for a user (care recipients with their medications)
const getUserMedicationData = async (username) => {
    try {
        // Verify user exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error("User does not exist");
        }

        const recipients = await CareRecipient.find({ username }).sort({ createdAt: -1 });
        
        const recipientsWithMedications = await Promise.all(
            recipients.map(async (recipient) => {
                const medications = await Medication.find({ 
                    careRecipientId: recipient._id, 
                    username 
                }).sort({ createdAt: -1 });
                
                return {
                    ...recipient.toObject(),
                    medications
                };
            })
        );

        return recipientsWithMedications;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    // Care Recipients
    createCareRecipient,
    getCareRecipients,
    updateCareRecipient,
    deleteCareRecipient,
    
    // Medications
    createMedication,
    getMedications,
    updateMedication,
    deleteMedication,
    
    // Combined
    getUserMedicationData
};
