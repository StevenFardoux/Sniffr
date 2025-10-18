import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.scss";

/**
 * Register component that handles new user account creation
 * @returns {JSX.Element} User registration form page
 */
const Register: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const { register } = useAuth();
    const navigate = useNavigate();

    /**
     * Handle form submission for user registration
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(username, email, password);
            navigate("/login");
        } catch (err: any) {
            setError(err.message || "Échec lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="text-center">
                    <h1 className="heading">Créer un compte</h1>
                </div>

                {error && (
                    <div className="error-alert" role="alert">
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="text" className="form-label">
                            Nom d'utilisateur   
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="Jean_dup"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="nom@exemple.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="form-label">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? "Inscription en cours..." : "S'inscrire"}
                        </button>
                    </div>
                </form>

                <div className="login-text">
                    <p>
                        Vous avez déjà un compte ?{" "}
                        <Link to="/login" className="link">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;