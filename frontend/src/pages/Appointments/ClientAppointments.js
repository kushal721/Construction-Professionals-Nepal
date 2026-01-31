import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiClock, FiXCircle, FiTrash2, FiMapPin, FiCalendar, FiUser, FiMessageSquare } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./ClientAppointments.css";
import "react-toastify/dist/ReactToastify.css";

const ClientAppointments = () => {
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("confirmed");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthContext();

  useEffect(() => {
    const fetchClientAppointments = async () => {
      if (!user || !user?.token) return;

      try {
        const response = await fetch(
          `http://localhost:4000/api/appointments/client-appointments`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setConfirmedAppointments(
            data.appointments.filter((app) => app.appointment.status === "confirmed")
          );
          setPendingAppointments(
            data.appointments.filter((app) => app.appointment.status === "pending" || app.appointment.status === "Waiting")
          );
          setCancelledAppointments(
            data.appointments.filter((app) => app.appointment.status === "cancelled")
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setLoading(false);
      }
    };

    fetchClientAppointments();
  }, [user]);

  const handleDeleteClick = (id) => {
    setAppointmentToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/deleteCancelledAppointments/${appointmentToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        setCancelledAppointments((prev) =>
          prev.filter((app) => app.appointmentDetails?._id !== appointmentToDelete && app.appointment?._id !== appointmentToDelete)
          // Note: API might be returning different ID structure, kept broad for safety
        );
        // Refresh list to be safe or rely on filter. The API seems to delete physically.
        // Re-fetch might be safer but for now filter.
        setCancelledAppointments(prev => prev.filter(app => app.appointment._id !== appointmentToDelete));
        toast.success("Appointment deleted successfully!");
      } else {
        toast.error("Failed to delete appointment.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
    setShowDeleteModal(false);
  };

  const renderAppointmentList = (appointments, type) => {
    if (appointments.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            {type === 'confirmed' ? <FiCalendar /> : type === 'pending' ? <FiClock /> : <FiXCircle />}
          </div>
          <h3>No {type} appointments</h3>
          <p>You don't have any appointments in this category.</p>
        </div>
      );
    }

    return (
      <div className="appointments-grid">
        {appointments.map((item) => (
          <div key={item.appointment._id} className="appointment-card">
            <div className={`status-strip ${type}`}></div>
            <div className="card-header">
              <div className="prof-info">
                <div className="prof-avatar">
                  <FiUser />
                </div>
                <div>
                  <h4>{item.professionalDetails?.username || "Professional"}</h4>
                  <span className="prof-email">{item.professionalDetails?.email}</span>
                </div>
              </div>
              {type === 'cancelled' && (
                <button
                  className="delete-icon-btn"
                  onClick={() => handleDeleteClick(item.appointment._id)}
                  title="Remove"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>

            <div className="card-body">
              <div className="info-row">
                <FiCalendar className="info-icon" />
                <span>
                  {new Date(item.appointmentDetails?.date).toLocaleDateString()}
                </span>
              </div>
              <div className="info-row">
                <FiClock className="info-icon" />
                <span>{item.appointment?.appointmentTime}</span>
              </div>
              <div className="info-row">
                <FiMapPin className="info-icon" />
                <span>{item.appointmentDetails?.location}</span>
              </div>
              {item.appointment?.remark && (
                <div className="remark-box">
                  <FiMessageSquare className="remark-icon" />
                  <p>"{item.appointment.remark}"</p>
                </div>
              )}
            </div>

            <div className="card-footer">
              <span className={`status-badge ${type}`}>
                {item.appointment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="My Appointments" subtitle="Manage your bookings">
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Appointments" subtitle="Track and manage your bookings with professionals">
      <ToastContainer />

      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
        >
          <FiCheckCircle /> Confirmed
          <span className="badge">{confirmedAppointments.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FiClock /> Pending
          <span className="badge warning">{pendingAppointments.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          <FiXCircle /> Cancelled
          <span className="badge danger">{cancelledAppointments.length}</span>
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'confirmed' && renderAppointmentList(confirmedAppointments, 'confirmed')}
        {activeTab === 'pending' && renderAppointmentList(pendingAppointments, 'pending')}
        {activeTab === 'cancelled' && renderAppointmentList(cancelledAppointments, 'cancelled')}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Appointment?</h3>
            <p>Are you sure you want to remove this cancelled appointment history?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientAppointments;
