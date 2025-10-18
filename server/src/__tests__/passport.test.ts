import passport from '../config/passport';
import { User } from '../DB';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { IUsers } from '../interfaces';

let mongod: MongoMemoryServer;

/**
 * Test data
 */
const testUser = {
    Username: 'TestUser',
    Email: 'test@example.com',
    Password: 'Test123!@#',
    Role: 1
};

/**
 * Test configuration
 */
beforeAll(async () => {
    // Use MongoDB Memory Server for testing
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to in-memory database
    await mongoose.connect(uri);
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

describe('Passport Tests', () => {
    /**
     * Testing local strategy
     */
    describe('LocalStrategy', () => {
        beforeEach(async () => {
            // Create a user for testing
            await User.create(testUser);
        });

        test('should authenticate a user with valid credentials', (done) => {
            // Simulate authentication with passport
            const authenticate = (email: string, password: string) => {
                return new Promise((resolve, reject) => {
                    passport.authenticate('local', (err: Error | null, user: any, info: { message: string }) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ user, info });
                        }
                    })({ body: { Email: email, Password: password } } as any, {} as any, () => { });
                });
            };

            // Test authentication
            authenticate(testUser.Email, testUser.Password)
                .then(({ user, info }: any) => {
                    expect(user).toBeTruthy();
                    expect(user.Email).toBe(testUser.Email);
                    expect(user.Username).toBe(testUser.Username);
                    done();
                })
                .catch(done);
        });

        test('should reject a user with incorrect email', (done) => {
            // Simulate authentication with passport
            const authenticate = (email: string, password: string) => {
                return new Promise((resolve, reject) => {
                    passport.authenticate('local', (err: Error | null, user: any, info: { message: string }) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ user, info });
                        }
                    })({ body: { Email: email, Password: password } } as any, {} as any, () => { });
                });
            };

            // Test authentication with incorrect email
            authenticate('wrong@example.com', testUser.Password)
                .then(({ user, info }: any) => {
                    expect(user).toBeFalsy();
                    expect(info.message).toBeTruthy();
                    done();
                })
                .catch(done);
        });

        test('should reject a user with incorrect password', (done) => {
            // Simulate authentication with passport
            const authenticate = (email: string, password: string) => {
                return new Promise((resolve, reject) => {
                    passport.authenticate('local', (err: Error | null, user: any, info: { message: string }) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ user, info });
                        }
                    })({ body: { Email: email, Password: password } } as any, {} as any, () => { });
                });
            };

            // Test authentication with incorrect password
            authenticate(testUser.Email, 'wrongPassword')
                .then(({ user, info }: any) => {
                    expect(user).toBeFalsy();
                    expect(info.message).toBeTruthy();
                    done();
                })
                .catch(done);
        });
    });

    /**
     * Testing serialization and deserialization
     */
    describe('Serialization/Deserialization', () => {
        let userId: string;

        beforeEach(async () => {
            // Create a user for testing
            const user = await User.create(testUser);
            userId = user._id.toString();
        });

        test('should serialize user to ID', (done) => {
            User.findById(userId)
                .then((user: any) => {
                    passport.serializeUser(user as any, (err, id) => {
                        expect(err).toBeNull();
                        expect(id).toBe(userId);
                        done();
                    });
                })
                .catch(done);
        });

        test('should deserialize ID to user', (done) => {
            passport.deserializeUser(userId, (err, user) => {
                expect(err).toBeNull();
                expect(user).toBeTruthy();
                expect((user as any)._id.toString()).toBe(userId);
                done();
            });
        });
    });
}); 