import React, { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useIots } from "../contexts/IoTContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { IDevices, IGroup } from "../interfaces";
import { Button, IotDrawer } from "../components";
import "../styles/DevicesList.scss";

/**
 * DevicesList component that displays a table of IoT devices with filtering and editing capabilities
 * @returns {JSX.Element | JSX.Element} Devices list page or redirect to login
 */
const DevicesList: React.FC = () => {
    const [filter, setFilter] = useState<string>("");
    const [selectedIot, setSelectedIot] = useState<IDevices | null>(null);

    const { iots, updateIot } = useIots();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    /**
     * Extract unique group names from all devices for filter dropdown
     */
    const groups = Array.from(new Set(
        iots.flatMap(iot => iot.Group_Id.map(group => group.Name))
    ));

    /**
     * Filter devices based on selected group
     */
    const filteredIots = filter === ""
        ? iots
        : iots.filter(iot => iot.Group_Id.some(group => group.Name === filter));


    return (
        <div className="list-container">
            <div className={`table-card ${selectedIot ? "drawer-open" : ""}`}>
                <div className="header">
                    <h1 className="heading">Liste des IoTs</h1>
                </div>

                <div className="option-container">
                    <div className="filter">
                        <label className="label">
                            Filtrer par groupe :{" "}
                            <select className="combo"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="">Tous</option>
                                {groups.map((groupName) => (
                                    <option key={groupName} value={groupName}>
                                        {groupName}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="add-iot">
                        <Button onClick={() => navigate(`/pair`)}>Ajouter nouvelle IoT</Button>
                    </div>
                </div>

                <table className="table-iot">
                    <thead>
                        <tr>
                            <th>IMEI</th>
                            <th>Nom</th>
                            <th>Batterie</th>
                            <th>Dernière connexion</th>
                            <th>Date d'enregistrement</th>
                            <th>Groupe</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIots.map((iot) => (
                            <tr key={iot.IMEI} onClick={() => setSelectedIot(iot)}>
                                <td>{iot.IMEI}</td>
                                <td>{iot.Name}</td>
                                <td>{iot.BatterieStatus}%</td>
                                <td>{new Date(iot.DateLastConn).toLocaleString()}</td>
                                <td>{new Date(iot.DateRegister).toLocaleString()}</td>
                                <td>{iot.Group_Id.map(group => group.Name).join(', ')}</td>
                                <td><Button onClick={() => navigate(`/map/${iot.IMEI}`)}>Map</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedIot && (
                <div className="iot-drawer">
                    <IotDrawer
                        iot={selectedIot}
                        onClose={() => setSelectedIot(null)}
                        onSave={(updated) => {
                            console.log("update ", updated);
                            if (updated.Name !== "" && (updated.Name !== selectedIot.Name || updated.Group_Id !== selectedIot.Group_Id)) {
                                const groupIds = updated.Group_Id.map((group: IGroup) => group._id);
                                updateIot(updated.IMEI, updated.Name, groupIds);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default DevicesList;