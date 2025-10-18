import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { IUser, IAuthCtx } from "../interfaces";
import { useWebsocket } from './WebsocketContext';

/**
 * Authentication context for managing user authentication state
 */
const AuthContext = createContext<IAuthCtx | undefined>(undefined);

/**
 * AuthProvider component that manages authentication state and provides auth functionality
 * @param children - Child components that will have access to auth context
 * @returns {JSX.Element} Provider component with authentication functionality
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [expireDate, setExpireDate] = useState<Date | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [cookie, setCookie] = useState<string | null>(null);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    useEffect(() => {
        /**
         * Fetch user data from the server and update the user state
         */
        if (!user) {
            fetchUser();
        }

        /**
         * Set up an interval to check the remaining time until the token expires
         */
        const interval = setInterval(() => {
            if (expireDate && isAuthenticated) {
                const timeLeft: number = expireDate.getTime() - Date.now();
                setRemainingTime(timeLeft);
                if (timeLeft <= 5000) {
                    logout();
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    /**
     * Update user state and authentication status
     * @param newUser - New user data or null
     * @param newExpireDate - New expiration date or null
     */
    const updateUserState = (newUser: IUser | null, newExpireDate: Date | null): void => {
        setUser(newUser);
        setIsAuthenticated(!!newUser);

        if (newUser) {
            setExpireDate(newExpireDate);
        } else {
            setExpireDate(null);
        }
    };

    /**
     * Fetch current user information from the server
     */
    const fetchUser = async (): Promise<void> => {
        try {
            const response = await axios.get<{ user: IUser, expireDate: Date }>(
                "http://localhost:3001/me",
                { withCredentials: true }
            );

            updateUserState(response.data.user, null);
        } catch (error) {
            updateUserState(null, null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Authenticate user with email and password
     * @param email - User email
     * @param password - User password
     * @returns Promise resolving to user data
     * @throws Error if login fails
     */
    const login = async (email: string, password: string): Promise<IUser> => {
        try {
            const response = await axios.post<{ message: string; user: IUser; expireDate: Date }>(
                "http://localhost:3001/login",
                { Email: email, Password: password },
                {
                    withCredentials: true,
                }
            );

            updateUserState(response.data.user, response.data.expireDate);
            return response.data.user;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Login error");
        }
    };

    /**
     * Log out the current user
     */
    const logout = async (): Promise<void> => {
        try {
            await axios.post(
                "http://localhost:3001/logout",
                {},
                { withCredentials: true }
            );
        } finally {
            setExpireDate(null);
            updateUserState(null, null);
        }
    };

    /**
     * Register a new user
     * @param username - Username for the new user
     * @param email - Email for the new user
     * @param password - Password for the new user
     * @throws Error if registration fails
     */
    const register = async (username: string, email: string, password: string): Promise<void> => {
        try {
            const response = await axios.post<{ message: string}>(
                "http://localhost:3001/register",
                {Username: username, Email: email, Password: password },
                {
                    withCredentials: true
                }
            );

            console.log(response);
        } catch (error: any) {
            if (error.response?.data?.error.issues) 
            {
            throw new Error(error.response?.data?.error.issues[0].message || "Registration error");
            } else {
                throw new Error(error.response?.data?.error || "Registration error");
            }
        }
    };    /**
     * Loading state handling to ensure that the user data is fetched before rendering the children components
     */
    if (loading) {
        return null; // Optionally insert a loading spinner or placeholder here
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, expireDate, login, logout, register, cookie}}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use the Authentication context
 * @returns The authentication context value
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): IAuthCtx => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};