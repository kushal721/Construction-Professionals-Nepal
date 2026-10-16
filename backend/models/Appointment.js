import mongoose from "mongoose";

const { Schema } = mongoose;

// An availability window published by a professional ("Appointment" kept for
// compatibility with existing data).
const appointmentSchema = new Schema(
  {
    professional: { type: Schema.Types.ObjectId, ref: "user", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true }, // "HH:mm"
    location: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

// A client's booking inside one availability window.
const bookingSchema = new Schema(
  {
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    professional: { type: Schema.Types.ObjectId, ref: "user", required: true },
    client: { type: Schema.Types.ObjectId, ref: "user", required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    appointmentTime: { type: String, required: true }, // "HH:mm"
    remark: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export { Appointment, Booking };
