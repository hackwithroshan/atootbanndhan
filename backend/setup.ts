
import mongoose from 'mongoose';
import { seedDatabase as seedDB } from './seed';

const fixDatabaseIndexes = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log("DB not connected, skipping index fix.");
            return;
        }
        const collections = await mongoose.connection.db?.listCollections({ name: 'users' }).toArray();
        if (collections && collections.length > 0) {
            const usersCollection = mongoose.connection.collection('users');
            const indexes = await usersCollection.indexes();
            const mobileIndex = indexes.find(idx => idx.name === 'mobileNumber_1');
            if (mobileIndex && !mobileIndex.sparse) {
                console.log("🔧 [Manual Setup] Dropping strict 'mobileNumber_1' index...");
                await usersCollection.dropIndex('mobileNumber_1');
                console.log("✅ [Manual Setup] Index dropped successfully. Mongoose will recreate it on next startup.");
            } else {
                console.log("✅ [Manual Setup] 'mobileNumber_1' index is already sparse or does not exist. No action needed.");
            }
        }
    } catch (err) {
        console.error("⚠️ [Manual Setup] Index fix failed:", err);
        throw err; // Propagate error
    }
};

export const setupDatabase = async () => {
    console.log("--- Starting One-Time Database Setup ---");
    await fixDatabaseIndexes();
    await seedDB();
    console.log("--- One-Time Database Setup Complete ---");
};
