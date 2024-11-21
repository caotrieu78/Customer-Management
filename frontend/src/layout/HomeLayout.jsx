import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import Slidebar from "../Components/Slidebar/Slidebar";

const HomeLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className="container-fluid d-flex flex-column vh-100">
            <div className="row flex-grow-1">
                {/* Sidebar */}
                <div
                    className={`${isSidebarCollapsed ? "col-auto" : "col-md-3 col-lg-2"
                        } bg-dark text-white p-0 vh-100`}
                >
                    <Slidebar isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Main content area */}
                <div
                    className={`${isSidebarCollapsed ? "col" : "col-md-9 col-lg-10"
                        } p-0 d-flex flex-column`}
                >
                    <Header toggleSidebar={toggleSidebar} />
                    <main className="content flex-grow-1 p-4 bg-light">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomeLayout;
