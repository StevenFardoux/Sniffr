import React, { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import { IDevicesCtx, IDevices, IGroup } from "../interfaces";
import { useAuth } from "./AuthContext";

/**
 * IoT context for managing application-wide IoT device data
 */
const IotContext = createContext<IDevicesCtx | undefined>(undefined);

/**
 * IotProvider component that manages IoT device state and provides device functionality
 * @param children - Child components that will have access to IoT context
 * @returns {JSX.Element} Provider component with IoT device functionality
 */
export const IotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [iots, setIots] = useState<IDevices[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    loadIots();
  }, [user]);

  /**
   * Load IoT devices from the server
   */
  const loadIots = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<{ devices: IDevices[] }>(
        "http://localhost:3001/IoTByUser",
        { withCredentials: true }
      );
      setIots(response.data.devices);
      console.log(iots)
    } catch (err) {
      console.error("Erreur lors du chargement des IoTs", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing IoT device
   * @param imei - Device IMEI identifier
   * @param name - New device name
   * @param groups - Array of group IDs to assign to the device
   * @returns Error response if update fails
   */
  const updateIot = async (imei: string, name: string, groups: string[]): Promise<any> => {
    setLoading(true);

    try {
      console.log("param ", imei, name, groups);
      const response = await axios.patch<{ message: string }>(
        "http://localhost:3001/updateIot",
        { IMEI: imei, Name: name, Group_Id: groups },
        { withCredentials: true }
      );

      console.log("res ", response)
      await loadIots();
    } catch (err: any) {
      return err.response || "Erreur de connexion";
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pair a new IoT device with the user account
   * @param imei - Device IMEI identifier
   * @param name - Device name
   * @param groups - Array of group IDs to assign to the device
   * @returns Error response if pairing fails
   */
  const pairingIot = async (imei: string, name: string, groups: string[]): Promise<any> => {
    setLoading(true);

    try {
      console.log("param ", imei, name, groups);
      const response = await axios.patch<{ message: string }>(
        "http://localhost:3001/paringIot",
        { IMEI: imei, Name: name, Group_Id: groups },
        { withCredentials: true }
      );

      console.log("res ", response)

      loadIots();
      return response;
    } catch (err: any) {
      return err.response || "Erreur de connexion";
    } finally {
      setLoading(false);
    }
  };
  return (
    <IotContext.Provider value={{ iots, updateIot, pairingIot }}>
      {children}
    </IotContext.Provider>
  );
};

/**
 * Custom hook to use the IoT context
 * @returns The IoT context value
 * @throws Error if used outside of IotProvider
 */
export const useIots = (): IDevicesCtx => {
  const context = useContext(IotContext);
  if (!context) throw new Error("useIots must be used within an IotProvider");
  return context;
};
