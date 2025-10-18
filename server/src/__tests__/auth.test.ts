import request from 'supertest';
import Express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from '../config/passport';
import { User } from '../DB';
import AuthRouter from '../routes/AuthRoutes';
import UserRouter from '../routes/UserRoutes';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

/**
 * Create Express application for testing
 */
const app = Express();
app.use(bodyParser.json());
app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(AuthRouter);
app.use(UserRouter);

/**
 * Test variables
 */
const testUser = {
    Username: 'TestUser',
    Email: 'test@example.com',
    Password: 'Test123!@#',
    Role: 1
};

let mongod: MongoMemoryServer;
// Define the correct type for the agent
let agent: any;

beforeAll(async () => {
    // Use MongoDB Memory Server for testing
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to in-memory database instead of test database
    await mongoose.connect(uri);

    // Create an agent to maintain the session between requests
    agent = request.agent(app);
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});

/**
 * Clean database before each test
 */
beforeEach(async () => {
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
});

describe('Authentication Tests', () => {
    /**
     * Testing /register route
     */
    describe('Route /register', () => {
        test('should create a new user with valid information', async () => {
            const response = await request(app)
                .post('/register')
                .send(testUser)
                .expect(200);

            expect(response.body).toHaveProperty('return', 'Account successfully created');

            // Verify that the user has been created in the database
            const user = await User.findOne({ Email: testUser.Email });
            expect(user).toBeTruthy();
            expect(user?.Username).toBe(testUser.Username);
        });

        test('should reject a user with an email already in use', async () => {
            // First create a user
            await User.create(testUser);

            // Try to create a user with the same email
            const response = await request(app)
                .post('/register')
                .send(testUser)
                .expect(409);

            expect(response.body).toHaveProperty('error', 'Email already used for another account');
        });

        test('should reject a user with a weak password', async () => {
            const weakPasswordUser = {
                ...testUser,
                Password: 'weak'
            };

            const response = await request(app)
                .post('/register')
                .send(weakPasswordUser)
                .expect(400);

            expect(response.body.error).toBeTruthy();
        });
    });

    /**
     * Testing /login route
     */
    describe('Route /login', () => {
        beforeEach(async () => {
            // Create a user for login tests
            await User.create(testUser);
        });

        test('should log in a user with valid credentials', async () => {
            const response = await agent
                .post('/login')
                .send({
                    Email: testUser.Email,
                    Password: testUser.Password
                })
                .expect(200);

            expect(response.body).toHaveProperty('return', 'Login successful');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('Email', testUser.Email);
            expect(response.body.user).toHaveProperty('Username', testUser.Username);
            expect(response.body.user).not.toHaveProperty('Password');
        });

        test('should reject a user with an incorrect email', async () => {
            const response = await agent
                .post('/login')
                .send({
                    Email: 'wrong@example.com',
                    Password: testUser.Password
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        test('should reject a user with an incorrect password', async () => {
            const response = await agent
                .post('/login')
                .send({
                    Email: testUser.Email,
                    Password: 'wrongPassword123!@#'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * Testing /me route
     */
    describe('Route /me', () => {
        beforeEach(async () => {
            // Create a user and log in
            await User.create(testUser);
            await agent
                .post('/login')
                .send({
                    Email: testUser.Email,
                    Password: testUser.Password
                });
        });

        test('should return information about the logged in user', async () => {
            const response = await agent
                .get('/me')
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('Email', testUser.Email);
            expect(response.body.user).toHaveProperty('Username', testUser.Username);
            expect(response.body.user).not.toHaveProperty('Password');
        });

        test('should reject an unauthenticated user', async () => {
            // Use a new agent without a session
            const newAgent = request.agent(app);

            const response = await newAgent
                .get('/me')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    /**
     * Testing /logout route
     */
    describe('Route /logout', () => {
        beforeEach(async () => {
            // Create a user and log in
            await User.create(testUser);
            await agent
                .post('/login')
                .send({
                    Email: testUser.Email,
                    Password: testUser.Password
                });
        });

        test('should log out a logged in user', async () => {
            const logoutResponse = await agent
                .post('/logout')
                .expect(200);

            expect(logoutResponse.body).toHaveProperty('return', 'Logout successful');

            // Verify that the user is logged out by trying to access /me
            const meResponse = await agent
                .get('/me')
                .expect(401);

            expect(meResponse.body).toHaveProperty('error', 'Unauthorized');
        });
    });
}); 