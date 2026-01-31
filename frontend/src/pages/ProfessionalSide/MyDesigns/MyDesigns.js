import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiGrid, FiList, FiFilter } from "react-icons/fi";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import MyDesignCard from "../../../components/Cards/MyDesignsCard";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./MyDesigns.css";

const MyDesigns = () => {
  const [myDesigns, setMyDesigns] = useState([]);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/designs/profe/getDesigns",
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMyDesigns(data);
          setLoading(false);
        } else {
          console.error("Failed to fetch designs");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching designs:", error);
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchDesigns();
    }
  }, [user]);

  const handleDelete = (deletedId) => {
    setMyDesigns((prevDesigns) =>
      prevDesigns.filter((design) => design._id !== deletedId)
    );
  };

  const filteredDesigns = myDesigns.filter(
    (design) =>
      design.designName &&
      design.designName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="My Designs" subtitle="Manage your design portfolio">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading designs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Designs" subtitle="Manage your design portfolio">
      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar-left">
          <div className="search-field">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search designs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="filter-btn">
            <FiFilter />
            Filters
          </button>
        </div>
        <div className="action-bar-right">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
          <Link to="/dashboard/add-designs" className="add-btn">
            <FiPlus />
            Add Design
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{myDesigns.length}</div>
          <div className="stat-label">Total Designs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {myDesigns.filter(d => d.status === 'active').length || myDesigns.length}
          </div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(myDesigns.reduce((acc, d) => acc + (d.averageRating || 0), 0) / (myDesigns.length || 1) * 10) / 10}
          </div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      {/* Designs Grid */}
      {filteredDesigns.length > 0 ? (
        <div className={`designs-grid ${viewMode}`}>
          {filteredDesigns.map((my_design) => (
            <MyDesignCard
              key={my_design._id}
              my_design={my_design}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📐</div>
          <h3>No designs found</h3>
          <p>Create your first design to get started</p>
          <Link to="/dashboard/add-designs" className="add-btn">
            <FiPlus />
            Add Design
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyDesigns;
