import React from "react";

function Header({ toggleSidebar }) {
    return (
        <header className="bg-white shadow-sm p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    {/* Sidebar Toggle Button */}
                    <button className="btn btn-outline-primary me-3" onClick={toggleSidebar}>
                        <i className="bi bi-list"></i>
                    </button>
                    <h5 className="text-primary m-0">Dashboard</h5>
                </div>
                <div className="d-flex align-items-center">
                    {/* Notification Icon */}
                    <div className="me-3">
                        <i className="bi bi-bell-fill text-primary"></i>
                    </div>
                    {/* User Profile */}
                    <div className="d-flex align-items-center">
                        <img
                            src="https://via.placeholder.com/40"
                            alt="Profile"
                            className="rounded-circle me-2"
                        />
                        <span className="text-dark">Jie Anderson</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
