import mongoose from 'mongoose';

/**
 * Increase timeout for asynchronous tests
 */
jest.setTimeout(30000);

/**
 * Function executed before all tests
 * We don't connect to the database here because each test file
 * will handle its own connection to MongoDB Memory Server
 */
beforeAll(async () => {
    // No connection here, each test file will handle its own connection
});

/**
 * Function executed after all tests
 */
afterAll(async () => {
    // Close database connection if open
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
}); 