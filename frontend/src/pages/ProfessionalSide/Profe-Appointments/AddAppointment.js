import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import "./AddAppointment.css";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { toast } from "react-toastify";
import { FiCalendar, FiClock, FiMapPin, FiSave } from "react-icons/fi";

const AddAppointment = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      if (!appointmentData.date || !appointmentData.startTime || !appointmentData.endTime || !appointmentData.location) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

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
        // Reset form but keep professional ID
        setAppointmentData({
          professional: user.userId,
          date: "",
          startTime: "",
          endTime: "",
          location: "",
        });
      } else {
        toast.error(res.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Appointment" subtitle="Set up availability or schedule a new appointment">
      <div className="add-appointment-container fade-in">
        <form className="modern-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Details</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <div className="input-wrapper">
                  <FiCalendar className="input-icon" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={appointmentData.date}
                    onChange={handleInputChange}
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <div className="input-wrapper">
                    <FiClock className="input-icon" />
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={appointmentData.startTime}
                      onChange={handleInputChange}
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <div className="input-wrapper">
                    <FiClock className="input-icon" />
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={appointmentData.endTime}
                      onChange={handleInputChange}
                      className="modern-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <div className="input-wrapper">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={appointmentData.location}
                    onChange={handleInputChange}
                    placeholder="E.g., Virtual Meeting, Office, Site A"
                    className="modern-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span> Creating...
                </>
              ) : (
                <>
                  <FiSave /> Create Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddAppointment;
