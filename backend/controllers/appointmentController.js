import { Appointment, Booking } from "../models/Appointment.js";
import {
  HttpError,
  asyncHandler,
  assertObjectId,
  requireFields,
  isTime,
  toMinutes,
} from "../utils/http.js";

const ACTIVE = ["pending", "confirmed"];

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const validateSlot = ({ date, startTime, endTime }) => {
  if (Number.isNaN(new Date(date).getTime())) throw new HttpError(400, "Enter a valid date");
  if (!isTime(startTime) || !isTime(endTime)) throw new HttpError(400, "Times must be in HH:mm format");
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    throw new HttpError(400, "End time must be after start time");
  }
};

// ---------- Availability slots (professional) ----------

export const listMySlots = asyncHandler(async (req, res) => {
  const slots = await Appointment.find({ professional: req.user._id }).sort({ date: -1, startTime: 1 }).lean();
  const counts = await Booking.aggregate([
    { $match: { appointment: { $in: slots.map((s) => s._id) }, status: { $in: ACTIVE } } },
    { $group: { _id: "$appointment", count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [c._id.toString(), c.count]));
  res.json(slots.map((s) => ({ ...s, bookingCount: byId.get(s._id.toString()) || 0 })));
});

export const listProfessionalSlots = asyncHandler(async (req, res) => {
  const { professionalId } = req.params;
  assertObjectId(professionalId, "Professional");
  const slots = await Appointment.find({
    professional: professionalId,
    date: { $gte: startOfToday() },
  })
    .sort({ date: 1, startTime: 1 })
    .lean();
  const taken = await Booking.find({
    appointment: { $in: slots.map((s) => s._id) },
    status: { $in: ACTIVE },
  })
    .select("appointment appointmentTime")
    .lean();
  res.json(
    slots.map((s) => ({
      ...s,
      bookedTimes: taken.filter((b) => b.appointment.toString() === s._id.toString()).map((b) => b.appointmentTime),
    }))
  );
});

export const createSlot = asyncHandler(async (req, res) => {
  requireFields(req.body, ["date", "startTime", "endTime", "location"]);
  validateSlot(req.body);
  if (new Date(req.body.date) < startOfToday()) throw new HttpError(400, "Date can't be in the past");
  const { date, startTime, endTime, location } = req.body;
  const slot = await Appointment.create({ professional: req.user._id, date, startTime, endTime, location });
  res.status(201).json({ message: "Availability added", slot });
});

const loadOwnSlot = async (req) => {
  assertObjectId(req.params.id, "Slot");
  const slot = await Appointment.findById(req.params.id);
  if (!slot) throw new HttpError(404, "Slot not found");
  if (slot.professional.toString() !== req.user._id.toString()) {
    throw new HttpError(403, "You can only manage your own availability");
  }
  return slot;
};

export const updateSlot = asyncHandler(async (req, res) => {
  const slot = await loadOwnSlot(req);
  ["date", "startTime", "endTime", "location"].forEach((f) => {
    if (req.body[f] !== undefined) slot[f] = req.body[f];
  });
  validateSlot(slot);
  await slot.save();
  res.json({ message: "Availability updated", slot });
});

export const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await loadOwnSlot(req);
  await Booking.updateMany(
    { appointment: slot._id, status: { $in: ACTIVE } },
    { status: "cancelled" }
  );
  await slot.deleteOne();
  res.json({ message: "Availability removed; any active bookings were cancelled" });
});

// ---------- Bookings ----------

export const createBooking = asyncHandler(async (req, res) => {
  requireFields(req.body, ["slotId", "time"]);
  const { slotId, time, remark } = req.body;
  assertObjectId(slotId, "Slot");
  if (!isTime(time)) throw new HttpError(400, "Pick a valid time");

  const slot = await Appointment.findById(slotId);
  if (!slot) throw new HttpError(404, "That availability no longer exists");
  if (slot.professional.toString() === req.user._id.toString()) {
    throw new HttpError(400, "You can't book your own availability");
  }

  const slotDay = new Date(slot.date);
  slotDay.setHours(0, 0, 0, 0);
  if (slotDay < startOfToday()) throw new HttpError(400, "This date has passed");
  // A booking may start no later than 30 minutes before the window closes.
  if (toMinutes(time) < toMinutes(slot.startTime) || toMinutes(time) > toMinutes(slot.endTime) - 30) {
    throw new HttpError(400, `Choose a time between ${slot.startTime} and 30 minutes before ${slot.endTime}`);
  }

  if (await Booking.exists({ appointment: slotId, client: req.user._id, status: { $in: ACTIVE } })) {
    throw new HttpError(409, "You already have a booking in this slot");
  }
  if (await Booking.exists({ appointment: slotId, appointmentTime: time, status: { $in: ACTIVE } })) {
    throw new HttpError(409, "That time was just taken. Please pick another.");
  }

  const booking = await Booking.create({
    appointment: slot._id,
    professional: slot.professional,
    client: req.user._id,
    appointmentTime: time,
    remark,
  });
  res.status(201).json({ message: "Booking requested. You'll be notified when it's confirmed.", booking });
});

// Bookings for the signed-in user, from whichever side they're on.
export const listMyBookings = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "professional" ? { professional: req.user._id } : { client: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate("appointment", "date startTime endTime location")
    .populate("client", "username email contactNumber profile")
    .populate("professional", "username email contactNumber profile")
    .sort({ createdAt: -1 })
    .lean();
  res.json(bookings.filter((b) => b.appointment));
});

const TRANSITIONS = {
  professional: { pending: ["confirmed", "cancelled"], confirmed: ["completed", "cancelled"] },
  client: { pending: ["cancelled"], confirmed: ["cancelled"] },
};

export const updateBookingStatus = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Booking");
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new HttpError(404, "Booking not found");

  const me = req.user._id.toString();
  const side =
    booking.professional.toString() === me ? "professional" : booking.client.toString() === me ? "client" : null;
  if (!side) throw new HttpError(403, "This isn't your booking");

  const allowed = TRANSITIONS[side][booking.status] || [];
  if (!allowed.includes(status)) {
    throw new HttpError(400, `Can't change a ${booking.status} booking to ${status}`);
  }
  booking.status = status;
  await booking.save();
  res.json({ message: `Booking ${status}`, booking });
});

export const deleteBooking = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Booking");
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new HttpError(404, "Booking not found");
  const me = req.user._id.toString();
  if (![booking.professional.toString(), booking.client.toString()].includes(me)) {
    throw new HttpError(403, "This isn't your booking");
  }
  if (ACTIVE.includes(booking.status)) {
    throw new HttpError(400, "Cancel the booking before removing it");
  }
  await booking.deleteOne();
  res.json({ message: "Booking removed" });
});
