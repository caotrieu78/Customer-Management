import React from "react";
import { NavLink } from "react-router-dom";
import { PATHS } from "../../constant/pathnames";

function Slidebar({ isCollapsed }) {
    const menuItems = [
        { path: PATHS.USER, icon: "bi-person", label: "Quản lý người dùng" },
        { path: PATHS.CUSTOMER, icon: "bi-wallet2", label: "Quản lý khách hàng" },
        { path: PATHS.PROJECT, icon: "bi-bar-chart", label: "Quản lý dự án" },
        { path: PATHS.EVENT, icon: "bi-calendar-event", label: "Quản lý sự kiện" },
        { path: PATHS.REMAIND, icon: "bi-bell", label: "Quản lý nhắc nhở" },
        { path: PATHS.PAYMENT, icon: "bi-credit-card", label: "Quản lý thanh toán" },
    ];

    return (
        <nav className={`bg-dark text-white p-3 vh-100 d-flex flex-column ${isCollapsed ? "collapsed-sidebar" : ""}`}>
            <h5 className={`text-white mb-4 ${isCollapsed ? "d-none" : ""}`}>Trang Admin</h5>
            <ul className="nav flex-column">
                {menuItems.map((item, index) => (
                    <li className="nav-item mb-2" key={index}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link text-white ${isActive ? "active" : ""}`
                            }
                        >
                            <i className={`bi ${item.icon} me-2`}></i>
                            {!isCollapsed && item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Slidebar;
