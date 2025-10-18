import React, { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import { IGroup, IGroupsCtx } from "../interfaces";
import { useAuth } from "./AuthContext";

/**
 * Groups context for managing application-wide group data
 */
const GroupsContext = createContext<IGroupsCtx | undefined>(undefined);

/**
 * GroupsProvider component that manages group state and provides group functionality
 * @param children - Child components that will have access to groups context
 * @returns {JSX.Element} Provider component with groups functionality
 */
export const GroupsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<IGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();

    useEffect(() => {
        loadGroups();
    }, [user]);    /**
     * Load groups from the server
     */
    const loadGroups = async (): Promise<void> => {
        setLoading(true);

        try {
            const response = await axios.get<{ groups: IGroup[] }>(
                "http://localhost:3001/groups",
                { withCredentials: true }
            );

            setGroups(response.data.groups);
        } catch (err) {
            console.error("Erreur lors du chargement des groupes", err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <GroupsContext.Provider value={{ groups }}>
            {children}
        </GroupsContext.Provider>
    );
};

/**
 * Custom hook to use the Groups context
 * @returns The groups context value
 * @throws Error if used outside of GroupsProvider
 */
export const useGroups = (): IGroupsCtx => {
    const context = useContext(GroupsContext);
    if (!context) throw new Error("useGroups must be used within a GroupsProvider");
    return context;
};