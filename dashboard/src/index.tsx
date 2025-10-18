import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import Navbar from './components/Navbar';
import { AlertProvider } from './contexts/AlertContext';
import { WebsocketProvider } from './contexts/WebsocketContext';
import { IotProvider } from './contexts/IoTContext';
import { GroupsProvider } from './contexts/GroupContext';
import './index.scss';
import { AuthProvider } from './contexts/AuthContext';
import Login from './routes/Login';
import Register from './routes/Register';
import Dashboard from './routes/Dashboard';
import Pair from './routes/Pair';
import Map from './routes/Map';
import DevicesList from './routes/DevicesList';

/**
 * WebSocket server URL configuration
 */
const WEBSOCKET_SERVER_URL = 'ws://localhost:8080';

/**
 * Create root element for React application
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
/**
 * Render the main React application with all providers and routing configuration
 * 
 * Provider hierarchy (from outer to inner):
 * - AuthProvider: Manages user authentication state
 * - AlertProvider: Handles application-wide notifications
 * - IotProvider: Manages IoT device data and operations
 * - GroupsProvider: Manages device group data
 * - WebsocketProvider: Handles real-time communication
 */
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <IotProvider>
            <GroupsProvider>
              <WebsocketProvider
                autoConnect={true}
                serverUrl={WEBSOCKET_SERVER_URL}
              >
                <Navbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/devices" element={<DevicesList />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pair" element={<Pair />} />
                  <Route path="/map/:imei" element={<Map />} />
                </Routes>
              </WebsocketProvider>
            </GroupsProvider>
          </IotProvider>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

/**
 * Performance monitoring setup
 * Learn more: https://bit.ly/CRA-vitals
 */
reportWebVitals();
