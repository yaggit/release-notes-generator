const { MongoClient } = require('mongodb');

// code for database connection 
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/release-notes';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    if (!client.isConnected()) {
        console.log("Connecting to MongoDB...");
        try {
            await client.connect();
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
        await client.connect();
    }
    return client.db();
}

module.exports = { connectDB };