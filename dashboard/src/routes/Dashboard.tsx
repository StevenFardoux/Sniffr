import React, { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useIots } from "../contexts/IoTContext";
import { Navigate } from "react-router-dom";
import "../styles/Dashboard.scss";
import DataGroupChart from "../components/charts/dataGroupChart";
import BatterieStatusChart from "../components/charts/BatterieStatusChart";

/**
 * Dashboard component that displays overview statistics and charts for IoT devices
 * @returns {JSX.Element | JSX.Element} Dashboard page or redirect to login
 */
const Dashboard: React.FC = () => {
    const { iots } = useIots();
    const { isAuthenticated } = useAuth();

    /**
     * Calculate average time since last connection for all devices
     */
    const averageTimeSinceLastConnection = useMemo((): string => {
        if (iots.length === 0) return "0h 0m";
        
        const now = new Date();
        let totalTime = 0;
        for (const iot of iots) {
            totalTime += now.getTime() - new Date(iot.DateLastConn).getTime();
        }
        const averageMs = totalTime / iots.length;
        return `${Math.floor(averageMs / (1000 * 60 * 60))}h ${Math.floor((averageMs % (1000 * 60 * 60)) / (1000 * 60))}m`;
    }, [iots]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    /**
     * Extract unique group names from all devices
     */
    const groups = Array.from(new Set(
        iots.flatMap(iot => iot.Group_Id.map(group => group.Name))
    ));

    return (
        <div className="dashboard-container">
            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Total des Devices</h3>
                    <p className="stat-number">{iots.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Devices Actifs</h3>
                    <p className="stat-number">{iots.filter(iot => iot.BatterieStatus > 0).length}</p>
                </div>
                <div className="stat-card">
                    <h3>Nombre de Groupes</h3>
                    <p className="stat-number">{groups.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Temps moyen depuis dernière connexion</h3>
                    <p className="stat-number">{averageTimeSinceLastConnection}</p>
                </div>
                <div className="stat-card battery-warning">
                    <h3>Devices en batterie faible</h3>
                    <div className="battery-list">
                        {iots.filter(iot => iot.BatterieStatus <= 20).length === 0 ? (
                            <p className="no-warning">Aucun device en batterie faible</p>
                        ) : (
                            <ul>
                                {iots.filter(iot => iot.BatterieStatus <= 20).map(iot => (
                                    <li key={iot.IMEI}>{iot.Name} - {iot.BatterieStatus}%</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            
            <div className="charts-container">
                <div className="charts-grid">
                    <DataGroupChart />
                    <BatterieStatusChart />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;