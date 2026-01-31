import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import { FaUserTie, FaChartBar, FaUsers, FaStar, FaCommentDots } from "react-icons/fa";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./ProfessionalSummary.css";

const ProfessionalSummary = () => {
  const { user } = useAuthContext();
  const [professionalDesigns, setProfessionalDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionalDesigns = async () => {
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
          setProfessionalDesigns(data);
          setLoading(false);
        } else {
          throw new Error("Failed to fetch professional designs");
        }
      } catch (error) {
        console.error("Error fetching professional designs:", error.message);
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfessionalDesigns();
    }
  }, [user?.token]);

  // Calculate stats
  const totalDesigns = professionalDesigns.length;

  const totalRatings = professionalDesigns.reduce(
    (acc, design) => acc + (design.totalRatings || 0),
    0
  );

  const totalComments = professionalDesigns.reduce(
    (acc, design) => acc + (design.comments?.length || 0),
    0
  );

  const averageRating = totalDesigns > 0
    ? (professionalDesigns.reduce((acc, design) => acc + (design.averageRating || 0), 0) / totalDesigns).toFixed(1)
    : 0;

  return (
    <DashboardLayout title="Dashboard Overview" subtitle="Track your performance and engagement">
      <div className="summary-container fade-in">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="stats-grid">
            <StatCard
              icon={<FaChartBar />}
              title="Total Designs"
              value={totalDesigns}
              color="blue"
            />
            <StatCard
              icon={<FaCommentDots />}
              title="Total Comments"
              value={totalComments}
              color="purple"
            />
            <StatCard
              icon={<FaUsers />}
              title="Total Ratings"
              value={totalRatings}
              color="orange"
            />
            <StatCard
              icon={<FaStar />}
              title="Avg. Rating"
              value={averageRating}
              color="green"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon-wrapper">
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
);

export default ProfessionalSummary;
