import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../DB';

/**
 * Passport configuration
 * This file configures the passport middleware for authentication
 */
passport.use(new LocalStrategy({
    usernameField: 'Email',
    passwordField: 'Password'
},
    async (email, password, done) => {
        try {
            /**
             * Find the user by email
             */
            const user = await User.findOne({ Email: email });

            if (!user) {
                return done(null, false, { message: 'Email or password incorrect' });
            }

            /**
             * Verify the password
             */
            const isPasswordValid = user.verifyPassword(password);

            if (!isPasswordValid) {
                return done(null, false, { message: 'Email or password incorrect' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

/**
 * Serialization of the user to store in the session
 */
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

/**
 * Deserialization of the user from the session
 * It retrieves the user from the database using the id stored in the session
 */
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport; 