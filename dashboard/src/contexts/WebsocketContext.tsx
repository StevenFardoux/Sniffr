import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import IWebsocketCtx from '../interfaces/IWebsocketCtx';
import { useAlert } from './AlertContext';
import { useAuth } from './AuthContext';

/**
 * WebSocket Context provides WebSocket communication capabilities throughout the application.
 * Allows components to connect, send messages, and process received data from a WebSocket server.
 */
const WebsocketContext = createContext<IWebsocketCtx | undefined>(undefined);

/**
 * Props for the WebsocketProvider component
 */
interface WebsocketProviderProps {
    children: React.ReactNode;
    autoConnect?: boolean; // Automatically connect on mount
    serverUrl?: string;    // WebSocket server URL
}

/**
 * WebSocket Provider component that manages WebSocket connection and provides
 * WebSocket functionality to all child components.
 * @param children - Child components that will have access to WebSocket context
 * @param autoConnect - Whether to automatically connect on mount (default: true)
 * @param serverUrl - WebSocket server URL (default: 'ws://localhost:8080')
 * @returns {JSX.Element} Provider component with WebSocket functionality
 */
export const WebsocketProvider: React.FC<WebsocketProviderProps> = ({
    children,
    autoConnect = true,
    serverUrl = 'ws://localhost:8080'
}) => {
    // State for tracking WebSocket connection and data
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [lastMessage, setLastMessage] = useState<any | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const { addAlert } = useAlert();
    const { user } = useAuth();

    // Ref to avoid circular dependencies in callbacks
    const socketRef = useRef<WebSocket | null>(null);    /**
     * Establish a connection to the WebSocket server
     * @param url - The WebSocket server URL
     */
    const connect = useCallback((url: string): void => {
        if (socketRef.current) {
            socketRef.current.close();
        }

        try {
            const newSocket = new WebSocket(url);            // Set up event handlers for the WebSocket
            newSocket.onopen = (): void => {
                setIsConnected(true);
                setError(null);
                send({ type: 'connection', token: user?.Token || null });
                addAlert('WebSocket connection established', 'success');
            };

            newSocket.onmessage = (event: MessageEvent): void => {
                try {
                    // Try to parse message as JSON
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                } catch (e) {
                    // If not JSON, store raw message
                    setLastMessage(event.data);
                }
            };

            newSocket.onerror = (event: Event): void => {
                setError(new Error('WebSocket error'));
                addAlert('WebSocket error', 'error');
                console.error('WebSocket error:', event);
            };

            newSocket.onclose = (): void => {
                setIsConnected(false);
                addAlert('WebSocket connection closed', 'error');
            };

            // Update both state and ref for the socket
            setSocket(newSocket);
            socketRef.current = newSocket;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('WebSocket connection error'));
            setIsConnected(false);        }
    }, [addAlert, user?.Token]);

    /**
     * Close the WebSocket connection
     */
    const disconnect = useCallback((): void => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }
    }, []);    /**
     * Send a message to the WebSocket server
     * @param message - The message to send (string or object that will be JSON-stringified)
     */
    const send = useCallback((message: string | object): void => {
        if (!socketRef.current) {
            setError(new Error('Cannot send message: socket not initialized'));
            return;
        }

        if (socketRef.current.readyState !== WebSocket.OPEN) {
            setError(new Error('Cannot send message: socket not connected'));
            return;
        }

        try {
            const data = typeof message === 'string' ? message : JSON.stringify(message);
            socketRef.current.send(data);
        } catch (err) {
            setError(new Error(`Error sending message: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
    }, []);

    // Effect for automatic connection - runs once on component mount
    useEffect(() => {
        if (autoConnect && !socketRef.current) {
            connect(serverUrl);
        }

        // Cleanup on component unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, []);

    // Sync the ref with the state when socket changes
    useEffect(() => {
        socketRef.current = socket;
    }, [socket]);

    return (
        <WebsocketContext.Provider value={{ isConnected, connect, disconnect, send, lastMessage, error }}>
            {children}
        </WebsocketContext.Provider>
    );
};

/**
 * Custom hook to use the WebSocket context
 * @returns The WebSocket context value
 * @throws Error if used outside of WebsocketProvider
 */
export const useWebsocket = (): IWebsocketCtx => {
    const context = useContext(WebsocketContext);
    if (!context) {
        throw new Error('useWebsocket must be used within a WebsocketProvider');
    }
    return context;
};