import React, { useState, useEffect } from "react";
import { FiUsers, FiHome, FiTrendingUp, FiCalendar, FiActivity } from "react-icons/fi";
import axios from "axios";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import "./Summary.css";

const Summary = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDesigns: 0,
    totalProfessionals: 0,
    totalAppointments: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRes = await axios.get("http://localhost:4000/api/userr");
        const designsRes = await axios.get("http://localhost:4000/api/designs");

        const users = usersRes.data;
        const designs = designsRes.data;

        setStats({
          totalUsers: users.length,
          totalDesigns: designs.length,
          totalProfessionals: users.filter(u => u.role === 'professional').length,
          totalAppointments: 0,
        });

        // Create recent activity from users
        setRecentActivity(users.slice(0, 5).map(u => ({
          id: u._id,
          type: 'user',
          name: u.username,
          action: 'joined the platform',
          time: 'Recently'
        })));

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Overview of platform analytics">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of platform analytics">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-trend positive">
            <FiTrendingUp />
            <span>12%</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <FiHome />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalDesigns}</div>
            <div className="stat-label">Total Designs</div>
          </div>
          <div className="stat-trend positive">
            <FiTrendingUp />
            <span>8%</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalProfessionals}</div>
            <div className="stat-label">Professionals</div>
          </div>
          <div className="stat-trend positive">
            <FiTrendingUp />
            <span>5%</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalAppointments}</div>
            <div className="stat-label">Appointments</div>
          </div>
          <div className="stat-trend neutral">
            <span>-</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3 className="card-title">
              <FiActivity />
              Recent Activity
            </h3>
            <button className="card-action">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">
                  {activity.name?.charAt(0).toUpperCase()}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{activity.name}</strong> {activity.action}
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <a href="/dashboard/manageusers" className="quick-action-btn">
              <FiUsers />
              Manage Users
            </a>
            <a href="/dashboard/adminreport" className="quick-action-btn">
              <FiActivity />
              View Reports
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Summary;
