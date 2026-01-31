import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import "./DashboardLayout.css";

const DashboardLayout = ({ children, title, subtitle }) => {
    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Header */}
                <header className="dashboard-header">
                    <div className="dashboard-header-left">
                        <button className="dashboard-menu-btn">
                            <FiMenu />
                        </button>
                        <div className="dashboard-search">
                            <FiSearch className="dashboard-search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="dashboard-search-input"
                            />
                        </div>
                    </div>
                    <div className="dashboard-header-right">
                        <button className="dashboard-notification-btn">
                            <FiBell />
                            <span className="notification-badge">3</span>
                        </button>
                    </div>
                </header>

                {/* Page Header */}
                {title && (
                    <div className="dashboard-page-header">
                        <div>
                            <h1 className="dashboard-page-title">{title}</h1>
                            {subtitle && <p className="dashboard-page-subtitle">{subtitle}</p>}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
