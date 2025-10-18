import React, { useState } from "react";
import Select from 'react-select';
import { useAuth } from "../contexts/AuthContext";
import { useIots } from "../contexts/IoTContext";
import { useGroups } from "../contexts/GroupContext";
import { IGroup, IDevices } from "../interfaces";
import "../styles/Pair.scss";
import { Button } from "../components";

/**
 * Pair component that handles pairing new IoT devices with user accounts
 * @returns {JSX.Element} Device pairing form page
 */
const Pair: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [imei, setImei] = useState<string>("");
    const [selectedGroups, setSelectedGroups] = useState<IGroup[]>([]);
    const [iot, setIot] = useState<IDevices | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const { groups } = useGroups();
    const { iots, pairingIot } = useIots();

    /**
     * Search for an IoT device by IMEI in the available devices list
     * @param imei - Device IMEI identifier to search for
     */
    const searchIot = (imei: string): void => {
        setLoading(true);
        setError("");
        setSuccess("");
        console.log(iots);
        
        const foundIot = iots.find((iot) => imei === iot.IMEI);
        
        if (foundIot) {
            setIot(foundIot);
        } else {
            setError("IMEI inconnu ou invalide");
        }

        setLoading(false);
    };

    /**
     * Handle form submission for device pairing
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await pairingIot(imei, name, selectedGroups.map((group) => group._id));
            
            console.log("resss", res);
            
            if (res.status !== 200) {
                setError(res.data.error);
            } else {
                setSuccess("L'IoT a été appairé avec succès !");
                // Réinitialiser les champs du formulaire
                setName("");
                setImei("");
                setSelectedGroups([]);
            }
        } catch (err: any) {
            setError(err.message || "Erreur lors du jumelage");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pair-container">
            <div className="pair-card">
                {error && (
                    <div className="error-alert" role="alert">
                        <span className="error-text">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="success-alert" role="alert">
                        <span className="success-text">{success}</span>
                    </div>
                )}

                <form className="pair-form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="text" className="form-label">
                            IMEI de l'IoT
                        </label>
                        <input
                            type="text"
                            className="input"
                            required
                            min={3}
                            value={imei}
                            onChange={(e) => setImei(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="text" className="form-label">
                            Nom de l'IoT
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            className="input"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="IoT-xxx-001"
                        />
                    </div>

                    <div>
                        <label htmlFor="text" className="form-label">
                            Groupe de l'IoT
                        </label>
                        <Select
                            isMulti
                            required={true}
                            className="combo"
                            options={groups.map(g => ({ value: g, label: g.Name }))}
                            value={selectedGroups?.map(g => ({ value: g, label: g.Name }))}
                            onChange={(selected) => {
                                setSelectedGroups(selected ? selected.map(s => s.value) : []);
                            }}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}>
                            {loading ? "Enregistrement en cours..." : "Enregister"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Pair;