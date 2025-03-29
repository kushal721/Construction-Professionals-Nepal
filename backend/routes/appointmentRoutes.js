import express from "express";
import {
  createAppointment,
  getAppointmentsByProfessional,
  getAppointmentsOfClient,
  getAppointmentById,
  getBookingRequestsByProfessional,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  bookAppointment,
  // getClientAppointments,
  getConfirmedBookings,
  deleteCancelledAppointment,
} from "../controllers/appointmentController.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

// Route to create a new appointment
router.post("/add-appointment", createAppointment);

// Route to retrieve a specific appointment by professional( check appointment by client)
router.get("/check-appo/:professional", getAppointmentsByProfessional);

// Route to update an existing appointment
router.patch("/:appointmentId", updateAppointment);

// Route to delete an appointment
router.delete("/:id", deleteAppointment);

//private

router.use(requireAuth);

// Route to retrieve a specific appointment by id
router.get("/professional-appointment", getAppointmentById);

// Route to book an appointment by a client
router.post("/book-appointment", bookAppointment);

// Route to retrieve appointments booked by a client
// router.get("/client-appointments/:clientId", getClientAppointments);

// get confirmed bookings of professional
router.get("/confirmed-appointments/:con-appId", getConfirmedBookings);

router.delete("/deleteCancelledAppointments/:id", deleteCancelledAppointment);
// Route to retrieve booking request
router.get("/booking-request", getBookingRequestsByProfessional);

// Route to retrieve booking request
router.get("/client-appointments", getAppointmentsOfClient);

// Route to update appointment status
router.put("/:id/:action", updateAppointmentStatus);

export default router;
