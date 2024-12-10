import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService"; // Call the API from authService
import { PATHS } from "../../constant/pathnames"; // Paths constant

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState(""); // Store username in state
    const [password, setPassword] = useState(""); // Store password in state
    const [error, setError] = useState(""); // Store error message if any
    const [isLoading, setIsLoading] = useState(false); // Loading state

    // Handle form submit
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Send login info to API
            const response = await login(username, password);

            // Debug: Show API response
            console.log("Login Response:", response);

            // Ensure the role is present in the response
            if (!response.role) {
                throw new Error("Role not provided by the server.");
            }

            // Store user data in localStorage
            const userData = {
                username: response.username,
                userId: response.userId,
                role: response.role,
            };
            localStorage.setItem("user", JSON.stringify(userData));

            // Update app state with user data (through onLogin prop)
            onLogin(userData);

            // Navigate to the profile page
            navigate(PATHS.PROFILE);
        } catch (err) {
            // Show error if login fails
            console.error("Login error:", err);
            setError(err.response?.data?.message || "Invalid username or password.");
        } finally {
            // Stop loading
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ width: "400px" }}>
                <h2 className="text-center mb-4">Login</h2>
                {error && <div className="alert alert-danger text-center">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
