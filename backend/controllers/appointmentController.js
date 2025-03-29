// const Appointment = require("../models/appointment");
import { Appointment } from "../models/Appointment.js";
import { Booking } from "../models/Appointment.js";
import User from "../models/User.js";

import mongoose from "mongoose";

// Controller to create a new appointment
const createAppointment = async (req, res) => {
  try {
    const { professional, date, startTime, endTime, location } = req.body;

    // Check if all required fields are provided
    if (!professional || !date || !startTime || !endTime || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new appointment instance
    const appointment = new Appointment({
      professional,
      date,
      startTime,
      endTime,
      location,
    });

    // Save the appointment to the database
    await appointment.save();

    return res
      .status(201)
      .json({ message: "Appointment created successfully", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all appointments for a professional along with professional details
const getAppointmentsByProfessional = async (req, res) => {
  try {
    const { professional } = req.params;
    console.log("Professional IdfaD:", professional); // Log professional ID

    // Assuming the professional data is stored within the User model
    const user = await User.findById(professional).select("username email");

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "Professional not found" });
    }

    // Get appointments for the professional
    const appointments = await Appointment.find({ professional });

    console.log("Appointments:", appointments); // Log appointments
    console.log("Professional Details:", user); // Log professional details

    res.json({ appointments, professionalDetails: user });
  } catch (error) {
    console.error("Error:", error); // Log any errors
    res.status(500).json({ message: error.message });
  }
};

// Controller to retrieve all appointments created by the current user
const getAppointmentById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user._id;
    console.log("User ID:", userId);

    const appointments = await Appointment.find({ professional: userId });
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "Appointments not found" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBookingRequestsByProfessional = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "User not authenticated", success: false });
    }
    const professional = req.user;
    console.log("Professional ID:", professional); // Log professional ID

    // Get booking requests for the professional
    const bookingRequests = await Booking.find({ professional });

    // Retrieve client details and format date for each booking request
    const bookingRequestsDetails = await Promise.all(
      bookingRequests.map(async (request) => {
        // Assuming client ID is stored in the booking request
        const client = await User.findById(request.client).select(
          "username email"
        );
        const appointmentDetails = await Appointment.findById(
          request.appointment
        ).select("date location");

        // Format date to "YYYY-MM-DD"
        const formattedDate =
          appointmentDetails && appointmentDetails.date
            ? appointmentDetails.date.toISOString().slice(0, 10)
            : null;

        const location =
          appointmentDetails && appointmentDetails.location
            ? appointmentDetails.location
            : null;

        return {
          bookingRequest: request,
          appointmentDetails: {
            date: formattedDate,
            location: location,
          },
          clientDetails: client,
        };
      })
    );

    console.log("Booking Requests:", bookingRequestsDetails); // Log formatted booking requests

    res.json({
      bookingRequests: bookingRequestsDetails,
    });
  } catch (error) {
    console.error("Error:", error); // Log any errors
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentsOfClient = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const client = req.user;
    console.log("Client ID:", client); // Log client ID

    // Get appointments for the client
    const appointments = await Booking.find({ client });

    // Retrieve professional and format date for each appointment
    const appointmentsDetails = await Promise.all(
      appointments.map(async (request) => {
        // Assuming professional ID is stored in the booking request
        const professional = await User.findById(request.professional).select(
          "username email contactNumber"
        );
        const appointmentDetails = await Appointment.findById(
          request.appointment
        ).select("date location");

        // Check if appointmentDetails is null
        if (!appointmentDetails) {
          return null; // Return null if appointment details are not found
        }

        // Format date to "YYYY-MM-DD"
        const formattedDate = appointmentDetails.date
          ? appointmentDetails.date.toISOString().slice(0, 10)
          : null;

        return {
          appointment: request,
          appointmentDetails: {
            date: formattedDate,
            location: appointmentDetails.location,
          },
          professionalDetails: professional,
        };
      })
    );

    // Filter out null values
    const validAppointments = appointmentsDetails.filter(
      (appointment) => appointment !== null
    );

    console.log("Appointments:", validAppointments); // Log formatted appointments

    res.json({
      appointments: validAppointments,
    });
  } catch (error) {
    console.error("Error:", error); // Log any errors
    res.status(500).json({ message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id, action } = req.params;
    console.log("pid", id, action);

    // Check if the action is either 'confirm' or 'cancel'
    if (!["confirm", "cancel"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    let updatedAppointment;

    if (action === "confirm") {
      // Update appointment status to 'confirmed'
      updatedAppointment = await Booking.findByIdAndUpdate(
        id,
        { status: "confirmed", message: "Appointment Confirmed successfully" },
        { new: true }
      );
    } else if (action === "cancel") {
      // Update appointment status to 'cancelled' instead of removing it
      updatedAppointment = await Booking.findByIdAndUpdate(
        id,
        { status: "cancelled", message: "Appointment Cancelled successfully" },
        { new: true }
      );
    }

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    console.log("Updated appointment:", updatedAppointment);
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCancelledAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Booking.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // If the appointment is found, proceed to delete
    await Booking.findByIdAndDelete(id);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to update an existing appointment
const updateAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { date, startTime, endTime, location } = req.body;

  console.log("appointmentid", appointmentId);
  console.log(req.body, "reques body");
  try {
    // Find the appointment by appointmentId and update its information
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId }, // Search by appointmentId
      { date, startTime, endTime, location },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to delete an appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { appointment, professional, client, appointmentTime, remark } =
      req.body;

    // Check if the client has already booked this appointment
    const existingBooking = await Booking.findOne({ appointment, client });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "You have already booked this appointment" });
    }

    // Fetch startTime, endTime, and date from the Appointment model
    const appointmentDetails = await Appointment.findById(appointment);
    if (!appointmentDetails) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const { startTime, endTime, date } = appointmentDetails;

    // Parse appointmentTime, startTime, and endTime to Date objects
    const appointmentDateTime = new Date(date); // Set the date part
    const [appointmentHour, appointmentMinute] = appointmentTime.split(":");
    appointmentDateTime.setHours(appointmentHour, appointmentMinute, 0, 0);

    const startDateTime = new Date(date); // Set the date part
    const [startHour, startMinute] = startTime.split(":");
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(date); // Set the date part
    const [endHour, endMinute] = endTime.split(":");
    endDateTime.setHours(endHour, endMinute, 0, 0);

    console.log("Appointment Date:", appointmentDateTime);
    console.log("Start Time:", startDateTime);
    console.log("End Time:", endDateTime);

    // Check if appointmentTime falls within startTime and endTime
    if (
      appointmentDateTime >= startDateTime &&
      appointmentDateTime <= endDateTime
    ) {
      // Create new booking
      const newBooking = new Booking({
        appointment,
        professional,
        client,
        appointmentTime,
        remark,
      });
      const savedBooking = await newBooking.save();
      return res.status(201).json(savedBooking);
    } else {
      // Appointment time slot not available
      return res
        .status(400)
        .json({ message: "Appointment slot not available" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Controller to retrieve appointments booked by a client
const getClientAppointments = async (req, res) => {
  try {
    console.log("user", req.user);
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const clientId = req.user._id; // Assuming the authenticated user is the client
    console.log("Client ID:", clientId);

    const appointments = await Booking.find({ client: clientId });
    res.status(200).json(appointments);
    console.log("Appointments:", appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get confirmed appointments
const getConfirmedBookings = async (req, res) => {
  try {
    console.log("user", req.user);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    console.log("req user role", req.user.role);

    let confirmedBookings;

    if (req.user.role === "professional") {
      // Query the database for confirmed bookings associated with the professional's ID
      confirmedBookings = await Booking.find({
        professional: req.user._id,
        status: "confirmed",
      });
    } else if (req.user.role === "client") {
      // Query the database for confirmed bookings associated with the client's ID
      confirmedBookings = await Booking.find({
        client: req.user._id,
        status: "confirmed",
      });
    } else {
      return res.status(403).json({ error: "Invalid user role" });
    }

    // Send the confirmed bookings as a response
    res.status(200).json(confirmedBookings);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

export {
  createAppointment,
  getAppointmentById,
  getAppointmentsByProfessional,
  getAppointmentsOfClient,
  getBookingRequestsByProfessional,
  updateAppointmentStatus,
  deleteCancelledAppointment,
  updateAppointment,
  deleteAppointment,
  bookAppointment,
  getClientAppointments,
  getConfirmedBookings,
};
