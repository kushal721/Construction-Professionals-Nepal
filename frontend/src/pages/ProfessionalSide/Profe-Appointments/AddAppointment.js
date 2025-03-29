import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./AddAppointment.css"; // Import the CSS file for styling
import { useAuthContext } from "../../../hooks/useAuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAppointment = () => {
  const { user } = useAuthContext();

  const [appointmentData, setAppointmentData] = useState({
    professional: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  useEffect(() => {
    if (user) {
      setAppointmentData((prevData) => ({
        ...prevData,
        professional: user.userId,
      }));
    }
  }, [user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAppointmentData({
      ...appointmentData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = { ...appointmentData };

      const response = await fetch(
        "http://localhost:4000/api/appointments/add-appointment",
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const res = await response.json();

      if (response.ok) {
        toast.success(res.message);
      } else {
        // const errorData = await response.json(); // Get error message from response body
        toast.error(res.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment. Please try again.");
    }
  };

  return (
    <div className="maindiv">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="addAppointment-container">
        <div className="content">
          <div className="page-name">
            <h1 className="page-title">Add New Appointment</h1>
          </div>
          <form className="add-appointment-form" onSubmit={handleSubmit}>
            <h1 className="appointment-details-title">Appointment Details</h1>
            

            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={appointmentData.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time:</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={appointmentData.startTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time:</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={appointmentData.endTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={appointmentData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
              />
            </div>
            <div className="btn-create">
              <button className="create-button" type="submit">
                Create Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAppointment;
