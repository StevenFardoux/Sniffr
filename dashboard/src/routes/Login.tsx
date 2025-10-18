import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.scss";
import { useWebsocket } from "../contexts/WebsocketContext";

/**
 * Login component that handles user authentication
 * @returns {JSX.Element} Login form page
 */
const Login: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const { send } = useWebsocket();

    /**
     * Handle form submission for user login
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const user = await login(email, password);
            if (user) {
                console.log("Connexion réussie", user);
                send({ type: 'connection', token: user?.Token || null });
                navigate("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "Échec de la connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="text-center">
                    <h1 className="heading">Bienvenue</h1>
                    <p className="subheading">Veuillez vous connecter pour continuer</p>
                </div>

                {error && (
                    <div className="error-alert" role="alert">
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
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
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </button>
                    </div>
                </form>

                <div className="signup-text">
                    <p>
                        Vous n'avez pas de compte?{" "}
                        <Link to="/register" className="link">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;