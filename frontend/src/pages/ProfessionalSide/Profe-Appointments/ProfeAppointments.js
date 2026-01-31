import React, { useState, useEffect } from "react";
import { FiCheck, FiX, FiCalendar, FiClock, FiMapPin, FiMail, FiUser, FiMessageSquare } from "react-icons/fi";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import useAlert from "../../../components/errorAlert";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { toast } from "react-toastify";
import "./ProfeAppointments.css";

const ProfeAppointments = () => {
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, requests, history
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    const fetchAppointmentRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/appointments/booking-request`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.bookingRequests)) {
            setAppointmentRequests(data.bookingRequests);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointment requests:", error);
        setLoading(false);
      }
    };
    if (user?.token) {
      fetchAppointmentRequests();
    }
  }, [user]);

  const handleAction = async (id, action) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/${id}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const updatedAppointments = appointmentRequests.map((appointment) => {
          if (appointment.bookingRequest._id === id) {
            return {
              ...appointment,
              bookingRequest: {
                ...appointment.bookingRequest,
                status: action === "confirm" ? "confirmed" : "cancelled",
              },
            };
          }
          return appointment;
        });
        setAppointmentRequests(updatedAppointments);
        toast.success(`Appointment ${action === "confirm" ? "confirmed" : "cancelled"} successfully`);
      } else {
        toast.error(`Failed to update appointment status`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case "upcoming":
        return appointmentRequests.filter(
          (app) => app.bookingRequest.status === "confirmed"
        );
      case "requests":
        return appointmentRequests.filter(
          (app) => app.bookingRequest.status === "pending" || app.bookingRequest.status === "Waiting"
        );
      case "history":
        return appointmentRequests.filter(
          (app) => app.bookingRequest.status === "cancelled" || app.bookingRequest.status === "completed"
        );
      default:
        return [];
    }
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return (
      <DashboardLayout title="Appointments" subtitle="Manage your bookings">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Appointments" subtitle="Manage your bookings and requests">
      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
          <span className="count-badge">
            {appointmentRequests.filter(app => app.bookingRequest.status === 'confirmed').length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
          <span className="count-badge warning">
            {appointmentRequests.filter(app => app.bookingRequest.status === 'pending' || app.bookingRequest.status === 'Waiting').length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="appointments-list">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment.bookingRequest._id} className="appointment-card">
              <div className="appointment-header">
                <div className="client-info">
                  <div className="client-avatar">
                    <FiUser />
                  </div>
                  <div>
                    <h3 className="client-name">{appointment.clientDetails.username}</h3>
                    <div className="client-contact">
                      <FiMail className="icon-small" /> {appointment.clientDetails.email}
                    </div>
                  </div>
                </div>
                <div className={`status-badge ${appointment.bookingRequest.status.toLowerCase()}`}>
                  {appointment.bookingRequest.status}
                </div>
              </div>

              <div className="appointment-details">
                <div className="detail-item">
                  <FiClock className="detail-icon" />
                  <div>
                    <span className="label">Time</span>
                    <span className="value">{appointment.bookingRequest.appointmentTime}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FiCalendar className="detail-icon" />
                  <div>
                    <span className="label">Date</span>
                    <span className="value">{appointment.appointmentDetails?.date || 'N/A'}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FiMapPin className="detail-icon" />
                  <div>
                    <span className="label">Location</span>
                    <span className="value">{appointment.appointmentDetails?.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {appointment.bookingRequest.remark && (
                <div className="appointment-remark">
                  <FiMessageSquare className="remark-icon" />
                  <p>"{appointment.bookingRequest.remark}"</p>
                </div>
              )}

              <div className="appointment-actions">
                {activeTab === 'requests' && (
                  <>
                    <button
                      className="action-btn confirm"
                      onClick={() => handleAction(appointment.bookingRequest._id, "confirm")}
                    >
                      <FiCheck /> Accept
                    </button>
                    <button
                      className="action-btn cancel"
                      onClick={() => handleAction(appointment.bookingRequest._id, "cancel")}
                    >
                      <FiX /> Reject
                    </button>
                  </>
                )}
                {activeTab === 'upcoming' && (
                  <button
                    className="action-btn cancel-outline"
                    onClick={() => handleAction(appointment.bookingRequest._id, "cancel")}
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments found</h3>
            <p>You don't have any {activeTab} appointments.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfeAppointments;
