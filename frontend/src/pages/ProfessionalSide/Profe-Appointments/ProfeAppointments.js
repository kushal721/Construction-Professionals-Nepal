import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import useAlert from "../../../components/errorAlert"; // Import the useAlert hook
import "./ProfeAppointments.css";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { toast } from "react-toastify"; // Import toast for notifications

const ProfeAppointments = () => {
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const { user } = useAuthContext();
  const { showSuccess, showError } = useAlert(); // Use the useAlert hook

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
          } else {
            console.error("Data does not contain booking requests:", data);
          }
        } else {
          console.error("Failed to fetch appointment requests");
        }
      } catch (error) {
        console.error("Error fetching appointment requests:", error);
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
        // Update appointment status locally
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
        // Display success toast
        toast.success(
          `Appointment ${
            action === "confirm" ? "confirmed" : "cancelled"
          } successfully`
        );
      } else {
        console.error(`Failed to update appointment status (${action})`);
        // Display error toast
        toast.error(`Failed to update appointment status (${action})`);
      }
    } catch (error) {
      console.error(`Error updating appointment status (${action}):`, error);
      // Display error toast
      toast.error(
        `Error updating appointment status (${action}): ${error.message}`
      );
    }
  };

  return (
    <div className="maindiv">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="appointments-container">
        <div className="content">
          <div className="page-name">
            <h1 className="page-title">Confirmed Appointments</h1>
            <table className="appointment-table">
              <thead>
                <tr>
                  <th className="table-heading">Client Name</th>
                  <th className="table-heading">Email</th>
                  <th className="table-heading">Time</th>
                  <th className="table-heading">Location</th>
                  <th className="table-heading">Date</th>
                  <th className="table-heading">Remark</th>
                  <th className="table-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointmentRequests
                  .filter(
                    (appointment) =>
                      appointment.bookingRequest.status === "confirmed"
                  )
                  .map((appointment) => (
                    <tr
                      key={appointment.bookingRequest._id}
                      className="table-row"
                    >
                      <td className="table-data">
                        {appointment.clientDetails.username}
                      </td>
                      <td className="table-data">
                        {appointment.clientDetails.email}
                      </td>
                      <td className="table-data">
                        {appointment.bookingRequest?.appointmentTime}
                      </td>
                      <td className="table-data">
                        {appointment.appointmentDetails?.location}
                      </td>
                      <td className="table-data">
                        {appointment.appointmentDetails?.date}
                      </td>
                      <td className="table-data">
                        {appointment.bookingRequest.remark}
                      </td>
                      <td className="table-data">
                        <button
                          className="reject-button"
                          onClick={() =>
                            handleAction(
                              appointment.bookingRequest._id,
                              "cancel"
                            )
                          }
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="appointment-requests">
            <h2 className="table-title">Appointment Requests</h2>
            <table className="appointment-table">
              <thead>
                <tr>
                  <th className="table-heading">Client Name</th>
                  <th className="table-heading">Email</th>
                  <th className="table-heading">Time</th>
                  <th className="table-heading">Location</th>
                  <th className="table-heading">Date</th>
                  <th className="table-heading">Status</th>
                  <th className="table-heading">Remark</th>
                  <th className="table-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointmentRequests
                  .filter(
                    (appointment) =>
                      appointment.bookingRequest.status !== "confirmed"
                  )
                  .map((appointment) => (
                    <tr
                      key={appointment.bookingRequest._id}
                      className="table-row"
                    >
                      <td className="table-data">
                        {appointment.clientDetails.username}
                      </td>
                      <td className="table-data">
                        {appointment.clientDetails.email}
                      </td>
                      <td className="table-data">
                        {appointment.bookingRequest.appointmentTime}
                      </td>
                      <td className="table-data">
                        {appointment.appointmentDetails.location}
                      </td>
                      <td className="table-data">
                        {appointment.appointmentDetails.date}
                      </td>
                      <td className="table-data">
                        {appointment.bookingRequest.status}
                      </td>
                      <td className="table-data">
                        {appointment.bookingRequest.remark}
                      </td>
                      <td className="table-data">
                        <button
                          className="accept-button"
                          onClick={() =>
                            handleAction(
                              appointment.bookingRequest._id,
                              "confirm"
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="reject-button"
                          onClick={() =>
                            handleAction(
                              appointment.bookingRequest._id,
                              "cancel"
                            )
                          }
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfeAppointments;
