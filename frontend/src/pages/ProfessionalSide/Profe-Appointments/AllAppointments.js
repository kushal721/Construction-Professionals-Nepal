import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./ProfeAppointments.css";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCalendar, FiClock, FiMapPin, FiEdit2, FiTrash2, FiSave, FiX, FiCheck } from "react-icons/fi";

const AllAppointments = () => {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [editAppointment, setEditAppointment] = useState(null);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/appointments/professional-appointment`,
          {
            headers: {
              Authorization: `Bearer ${user?.token || ""}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        } else {
          console.error("Failed to fetch appointments");
          toast.error("Failed to fetch appointments");
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAppointments();
    }
  }, [user]);

  const handleEdit = (appointment) => {
    setEditAppointment({ ...appointment });
  };

  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setEditAppointment((prevAppointment) => ({
      ...prevAppointment,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/${editAppointment._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token || ""}`,
          },
          body: JSON.stringify(editAppointment),
        }
      );
      if (response.ok) {
        const updatedAppointments = appointments.map((appointment) =>
          appointment._id === editAppointment._id
            ? editAppointment
            : appointment
        );
        setAppointments(updatedAppointments);
        toast.success("Appointment updated successfully");
        setEditAppointment(null);
      } else {
        const errorMessage = await response.text();
        toast.error(`Failed to update appointment: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("An error occurred while updating appointment");
    }
  };

  const handleCancelEdit = () => {
    setEditAppointment(null);
  };

  const handleRemoveAppointment = (appointment) => {
    if (!appointment) return;
    setEditAppointment(appointment);
    setShowConfirmationPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!editAppointment || !editAppointment._id) return;

      const response = await fetch(
        `http://localhost:4000/api/appointments/${editAppointment._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (response.ok) {
        const updatedAppointments = appointments.filter(
          (appointment) => appointment._id !== editAppointment._id
        );
        setAppointments(updatedAppointments);
        toast.success("Appointment removed successfully");
        setShowConfirmationPopup(false);
        setEditAppointment(null);
      } else {
        const errorMessage = await response.text();
        toast.error(`Failed to remove appointment: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error removing appointment:", error);
      toast.error("An error occurred while removing appointment");
    }
  };

  return (
    <DashboardLayout title="My Appointments" subtitle="Manage your scheduled appointments">
      <div className="table-container fade-in">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiCalendar /></div>
            <h3>No Appointments Yet</h3>
            <p>You haven't scheduled any appointments.</p>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    {editAppointment && editAppointment._id === appointment._id ? (
                      <input
                        type="date"
                        className="edit-input"
                        value={editAppointment.date}
                        onChange={(e) => handleInputChange(e, "date")}
                      />
                    ) : (
                      <div className="td-content">
                        <FiCalendar className="td-icon" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    {editAppointment && editAppointment._id === appointment._id ? (
                      <input
                        type="time"
                        className="edit-input"
                        value={editAppointment.startTime}
                        onChange={(e) => handleInputChange(e, "startTime")}
                      />
                    ) : (
                      <div className="td-content">
                        <FiClock className="td-icon" />
                        {appointment.startTime}
                      </div>
                    )}
                  </td>
                  <td>
                    {editAppointment && editAppointment._id === appointment._id ? (
                      <input
                        type="time"
                        className="edit-input"
                        value={editAppointment.endTime}
                        onChange={(e) => handleInputChange(e, "endTime")}
                      />
                    ) : (
                      <div className="td-content">
                        <FiClock className="td-icon" />
                        {appointment.endTime}
                      </div>
                    )}
                  </td>
                  <td>
                    {editAppointment && editAppointment._id === appointment._id ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={editAppointment.location}
                        onChange={(e) => handleInputChange(e, "location")}
                      />
                    ) : (
                      <div className="td-content">
                        <FiMapPin className="td-icon" />
                        {appointment.location}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editAppointment && editAppointment._id === appointment._id ? (
                        <>
                          <button className="btn-icon-success" onClick={handleSave} title="Save">
                            <FiCheck />
                          </button>
                          <button className="btn-icon-danger" onClick={handleCancelEdit} title="Cancel">
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon-primary" onClick={() => handleEdit(appointment)} title="Edit">
                            <FiEdit2 />
                          </button>
                          <button className="btn-icon-danger" onClick={() => handleRemoveAppointment(appointment)} title="Delete">
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showConfirmationPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="close-btn" onClick={() => setShowConfirmationPopup(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this appointment? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirmationPopup(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AllAppointments;
