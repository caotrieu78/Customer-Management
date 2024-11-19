import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import Sidebar from "../Components/Slidebar/Slidebar";

const HomeLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div
                    className={`${isSidebarCollapsed ? "col-auto" : "col-md-3 col-lg-2"
                        } bg-dark text-white p-0 vh-100`}
                >
                    <Sidebar isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Main content area */}
                <div
                    className={`${isSidebarCollapsed ? "col" : "col-md-8 col-lg-9"
                        } p-0`}
                >
                    <Header toggleSidebar={toggleSidebar} />
                    <main className="content p-4 bg-light">
                        <Outlet />
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default HomeLayout;
