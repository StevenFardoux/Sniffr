import React, { useState, useEffect } from "react";
import Select from 'react-select';
import "./IotDrawer.scss";
import { IGroup, IDevices } from "../interfaces/";
import { useGroups } from "../contexts/GroupContext";

/**
 * Props for the IoT drawer component
 */
interface IotDrawerProps {
  iot: IDevices | null;
  onClose: () => void;
  onSave: (updatedIot: any) => void;
}

/**
 * IotDrawer component for editing IoT device information
 * @param iot - The IoT device to edit
 * @param onClose - Callback function to close the drawer
 * @param onSave - Callback function to save the updated IoT device
 * @returns {JSX.Element | null} The drawer component or null if no IoT device is provided
 */
const IotDrawer: React.FC<IotDrawerProps> = ({ iot, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<IGroup[]>([]);
  const { groups } = useGroups();

  useEffect(() => {
    if (iot) {
      setName(iot.Name);
      setSelectedGroups(iot.Group_Id);
    }
  }, [iot]);

  if (!iot) return null;

  return (
    <div className="iot-drawer">
      <div className="drawer-header">
        <h2>Modification de l'IoT</h2>
        <button onClick={onClose} className="close-btn">✖</button>
      </div>
      <div className="drawer-content">
        <label className="label">Nom :</label>
        <input className="" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="label">Groupe :</label>
        <Select
          isMulti
          options={groups.map(g => ({ value: g, label: g.Name }))}
          value={selectedGroups.map(g => ({ value: g, label: g.Name }))}
          onChange={(selected) => {
            setSelectedGroups(selected ? selected.map(s => s.value) : []);
          }}
        />
      <button
        className="save-btn"
        onClick={() => {
          onSave({
            ...iot,
            Name: name,
            Group_Id: selectedGroups
          });
        }}
      >
        Enregistrer
      </button>
    </div>
    </div >
  );
};

export default IotDrawer;
