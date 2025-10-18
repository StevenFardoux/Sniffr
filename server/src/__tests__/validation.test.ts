import { z } from 'zod';

/**
 * Validation schema for registration identical to the one used in AuthRoutes.ts
 */
const registerSchema = z.object({
    Username: z.string().min(3, "The username must contain at least 3 characters"),
    Email: z.string().email("Email must be valid"),
    Password: z.string().min(8, "The password must contain at least 8 characters")
        .regex(/[A-Z]/, "The password must contain at least 1 capital letter")
        .regex(/[a-z]/, "The password must contain at least 1 lower case letter")
        .regex(/\d/, "The password must contain at least 1 digit")
        .regex(/[@$!%*?&^#~()_\[\]|\\:<>./?]/, "The password must contain at least 1 special character")
});

/**
 * Validation schema for login identical to the one used in AuthRoutes.ts
 */
const loginSchema = z.object({
    Email: z.string().email("Email must be valid"),
    Password: z.string()
});

describe('Input Validation Tests', () => {
    describe('Registration Data Validation', () => {
        test('should validate correct registration data', () => {
            const validUserData = {
                Username: 'TestUser',
                Email: 'test@example.com',
                Password: 'Test123!@#'
            };

            const result = registerSchema.safeParse(validUserData);
            expect(result.success).toBe(true);
        });

        test('should reject a username that is too short', () => {
            const invalidUserData = {
                Username: 'Te',
                Email: 'test@example.com',
                Password: 'Test123!@#'
            };

            const result = registerSchema.safeParse(invalidUserData);
            expect(result.success).toBe(false);

            if (!result.success) {
                const formattedError = result.error.format();
                expect(formattedError.Username?._errors).toBeDefined();
            }
        });

        test('should reject an invalid email', () => {
            const invalidUserData = {
                Username: 'TestUser',
                Email: 'invalid-email',
                Password: 'Test123!@#'
            };

            const result = registerSchema.safeParse(invalidUserData);
            expect(result.success).toBe(false);

            if (!result.success) {
                const formattedError = result.error.format();
                expect(formattedError.Email?._errors).toBeDefined();
            }
        });

        test('should reject a password without capital letters', () => {
            const invalidUserData = {
                Username: 'TestUser',
                Email: 'test@example.com',
                Password: 'test123!@#'
            };

            const result = registerSchema.safeParse(invalidUserData);
            expect(result.success).toBe(false);

            if (!result.success) {
                const formattedError = result.error.format();
                expect(formattedError.Password?._errors).toBeDefined();
                expect(formattedError.Password?._errors.some(error =>
                    error.includes('capital letter')
                )).toBe(true);
            }
        });

        test('should reject a password without lowercase letters', () => {
            const invalidUserData = {
                Username: 'TestUser',
                Email: 'test@example.com',
                Password: 'TEST123!@#'
            };

            const result = registerSchema.safeParse(invalidUserData);
            expect(result.success).toBe(false);

            if (!result.success) {
                const formattedError = result.error.format();
                expect(formattedError.Password?._errors).toBeDefined();
                expect(formattedError.Password?._errors.some(error =>
                    error.includes('lower case letter')
                )).toBe(true);
            }
        });

        test('should reject a password without digits', () => {
            const invalidUserData = {
                Username: 'TestUser',
                Email: 'test@example.com',
                Password: 'TestPassword!@#'
            };

            const result = registerSchema.safeParse(invalidUserData);
            expect(result.success).toBe(false);

            if (!result.success) {
                const formattedError = result.error.format();
                expect(formattedError.Password?._errors).toBeDefined();
                expect(formattedError.Password?._errors.some(error =>
                    error.includes('digit')
                )).toBe(true);
            }
        });

        test('should reject a password without special characters', () => {
            const invalidUserData = {
                Username: 'TestUser',
                Email: 'test@example.com',
                Password: 'TestPassword123'
            };

            const result = registerSchema.safeParse(invalidUserData);
            expect(result.success).toBe(false);

            if (!result.success) {
                const formattedError = result.error.format();
                expect(formattedError.Password?._errors).toBeDefined();
                expect(formattedError.Password?._errors.some(error =>
                    error.includes('special character')
                )).toBe(true);
            }
        });
    });

    describe('Login Data Validation', () => {
        test('should validate correct login data', () => {
            const validLoginData = {
                Email: 'test@example.com',
                Password: 'Test123!@#'
            };

            const result = loginSchema.safeParse(validLoginData);
            expect(result.success).toBe(true);
        });

        test('should reject an invalid email', () => {
            const invalidLoginData = {
                Email: 'invalid-email',
                Password: 'Test123!@#'
            };

            const result = loginSchema.safeParse(invalidLoginData);
            expect(result.success).toBe(false);

            if (!result.success) {
                const formattedError = result.error.format();
                expect(formattedError.Email?._errors).toBeDefined();
            }
        });

        test('should reject incomplete data (missing password)', () => {
            const incompleteLoginData = {
                Email: 'test@example.com'
            };

            const result = loginSchema.safeParse(incompleteLoginData);
            expect(result.success).toBe(false);
        });
    });
}); 