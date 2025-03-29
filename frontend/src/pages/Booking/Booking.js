

//find appointments
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import NavbarComp from "../../components/Navbar/Navbar";
import BookingForm from "./BookingForm"; // Import BookingForm component
import "./Booking.css"; // Import CSS file

const Booking = () => {
  const { id } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [professionalDetails, setProfessionalDetails] = useState(null);
  const [bookingAppointmentId, setBookingAppointmentId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/appointments/check-appo/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments);
          setProfessionalDetails(data.professionalDetails);
        } else {
          console.error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleBookNow = (appointmentId) => {
    // Set the appointment ID for booking
    setBookingAppointmentId(appointmentId);
  };

  return (
    <div>
      <div className="booking-container">
        <h1
          style={{
            fontSize: "26px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          Book appointments
        </h1>
        {professionalDetails && (
          <>
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              Professional Details:
            </h2>
            <p>Username: {professionalDetails.username}</p>
            <p>Email: {professionalDetails.email}</p>
          </>
        )}
        <div className="appointment">
          <h1
            style={{
              fontSize: "18px",
              marginBottom: "15px",
              fontWeight: "bold",
            }}
          >
            Available Appointments:
          </h1>
          {appointments.length === 0 ? (
            <p>No appointments available</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <h2>Appointment ID: {appointment._id}</h2>
                <h2>
                  Appointment Date:{" "}
                  {new Date(appointment.date).toLocaleDateString()}
                  
                </h2>
                <p>
                  Appointment Timings: {appointment.startTime} to{" "}
                  {appointment.endTime}
                </p>
                <p>Location: {appointment.location}</p>
                {bookingAppointmentId !== appointment._id && ( // Hide button if booking form is shown
                  <button onClick={() => handleBookNow(appointment._id)}>
                    Book Now
                  </button>
                )}
                {bookingAppointmentId === appointment._id && (
                  <BookingForm appointmentId={bookingAppointmentId} />
                )}
                <hr />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
