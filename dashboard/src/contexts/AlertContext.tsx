import '../styles/Alert.scss';
import IAlert from '../interfaces/IAlert';
import IAlertCtx from '../interfaces/IAlertCtx';
import React, { createContext, useContext, useState } from 'react';

/**
 * Alert context for managing application-wide alert notifications
 */
const AlertContext = createContext<IAlertCtx | undefined>(undefined);

/**
 * AlertProvider component that manages alert state and provides alert functionality
 * @param children - Child components that will have access to alert context
 * @returns {JSX.Element} Provider component with alert functionality
 */
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<IAlert[]>([]);    /**
     * Add a new alert to the alert list
     * @param message - The alert message to display
     * @param type - The type of alert (success, error, info, warning)
     * @param duration - How long the alert should be displayed (default: 3000ms)
     */
    const addAlert = (message: string, type: "success" | "error" | "info" | "warning" = "info", duration?: number): void => {
        const newAlert: IAlert = { message, type };
        setAlerts((prev: IAlert[]) => [...prev, newAlert]);
        setTimeout(() => {
            setAlerts((prev: IAlert[]) => prev.filter((_, index: number) => index !== 0));
        }, duration || 3000);
    };    /**
     * Handle click event to dismiss an alert
     * @param index - Index of the alert to dismiss
     */
    const onClick = (index: number): void => {
        setAlerts((prev: IAlert[]) => prev.filter((_, i: number) => i !== index));
    }

    return (
        <AlertContext.Provider value={{ addAlert, alerts }}>
            {children}
            <div id="alert-container">
                {alerts.map((alert, index) => (
                    <div key={index} className={`alert ${alert.type}`} onClick={() => onClick(index)}>
                        {alert.message}
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
};

/**
 * Custom hook to use the Alert context
 * @returns The alert context value
 * @throws Error if used outside of AlertProvider
 */
export const useAlert = (): IAlertCtx => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};