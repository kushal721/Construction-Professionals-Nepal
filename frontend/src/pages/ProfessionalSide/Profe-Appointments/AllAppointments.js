
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./ProfeAppointments.css";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllAppointments = () => {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [editAppointment, setEditAppointment] = useState(null);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
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
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
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
    if (!appointment) {
      console.error("No appointment selected for deletion");
      return;
    }
    setEditAppointment(appointment); // Set the appointment to be deleted
    setShowConfirmationPopup(true); // Display confirmation popup
  };

  const handleConfirmDelete = async () => {
    try {
      if (!editAppointment || !editAppointment._id) {
        console.error("No appointment selected for deletion");
        return;
      }

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
      } else {
        const errorMessage = await response.text();
        toast.error(`Failed to remove appointment: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error removing appointment:", error);
      toast.error("An error occurred while removing appointment");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmationPopup(false);
  };

  return (
    <div className="maindiv">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="appointments-container">
        <div className="content">
          <div className="page-name">
            <h1 className="page-title">Created Appointments</h1>
            <table className="appointment-table">
              <thead>
                <tr>
                  <th className="table-heading">Date</th>
                  <th className="table-heading">Start Time</th>
                  <th className="table-heading">End Time</th>
                  <th className="table-heading">Location</th>
                  <th className="table-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="table-row">
                    <td className="table-data">
                      {editAppointment &&
                      editAppointment._id === appointment._id ? (
                        <input
                          type="date"
                          value={editAppointment.date}
                          onChange={(e) => handleInputChange(e, "date")}
                        />
                      ) : (
                        appointment.date
                      )}
                    </td>
                    <td className="table-data">
                      {editAppointment &&
                      editAppointment._id === appointment._id ? (
                        <input
                          type="time"
                          value={editAppointment.startTime}
                          onChange={(e) => handleInputChange(e, "startTime")}
                        />
                      ) : (
                        appointment.startTime
                      )}
                    </td>
                    <td className="table-data">
                      {editAppointment &&
                      editAppointment._id === appointment._id ? (
                        <input
                          type="time"
                          value={editAppointment.endTime}
                          onChange={(e) => handleInputChange(e, "endTime")}
                        />
                      ) : (
                        appointment.endTime
                      )}
                    </td>
                    <td className="table-data">
                      {editAppointment &&
                      editAppointment._id === appointment._id ? (
                        <input
                          type="text"
                          value={editAppointment.location}
                          onChange={(e) => handleInputChange(e, "location")}
                        />
                      ) : (
                        appointment.location
                      )}
                    </td>
                    <td className="table-data">
                      {editAppointment &&
                      editAppointment._id === appointment._id ? (
                        <>
                          <button className="save-btn" onClick={handleSave}>
                            Save
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(appointment)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleRemoveAppointment(appointment)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Confirmation popup */}
        {showConfirmationPopup && (
          <div className="confirmation-popup">
            <h3>Are you sure you want to delete?</h3>
            <div className="popup-buttons">
              <button className="popup-button" onClick={handleConfirmDelete}>
                Yes
              </button>
              <button className="popup-button" onClick={handleCancelDelete}>
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
