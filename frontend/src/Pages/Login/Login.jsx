import React from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../constant/pathnames";

function Login({ onLogin }) {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin(); // Update login state in App
        navigate(PATHS.HOME); // Navigate to the admin dashboard
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ width: "400px" }}>
                <h2 className="text-center mb-4">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email address
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <a href="/forgot-password" className="text-decoration-none">
                        Forgot password?
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Login;
