// Populates the database with demo data.
//   npm run seed           -> only seeds when there are no users yet
//   npm run seed -- --reset -> wipes the app's collections first
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDb from "../config/connectdb.js";
import UserModel from "../models/User.js";
import ProfessionalModel from "../models/Professional.js";
import Design from "../models/Design.js";
import Favorite from "../models/Favorite.js";
import ChatModel from "../models/ChatModel.js";
import MessageModel from "../models/MessageModel.js";
import { Appointment, Booking } from "../models/Appointment.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const reset = process.argv.includes("--reset");
const PASSWORD = "Password123";

const copyImages = () => {
  fs.mkdirSync("uploads/seed", { recursive: true });
  return fs
    .readdirSync(path.join(here, "images"))
    .sort()
    .map((name) => {
      const dest = `uploads/seed/${name}`;
      fs.copyFileSync(path.join(here, "images", name), dest);
      return dest;
    });
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const run = async () => {
  await connectDb(process.env.DATABASE_URL);

  if (reset) {
    await Promise.all(
      [UserModel, ProfessionalModel, Design, Favorite, ChatModel, MessageModel, Appointment, Booking].map((M) =>
        M.deleteMany({})
      )
    );
    console.log("Cleared existing data");
  } else if (await UserModel.estimatedDocumentCount()) {
    console.log("Database already has users. Run with --reset to wipe and reseed.");
    return;
  }

  const images = copyImages();
  const img = (...idx) => idx.map((i) => images[i % images.length]);
  const hash = await bcrypt.hash(PASSWORD, 10);

  const mk = (username, email, role, extra = {}) =>
    UserModel.create({ username, email, role, password: hash, ...extra });

  await mk("Admin", "admin@cpn.test", "admin", { location: "Kathmandu" });

  const pros = await Promise.all([
    mk("Sita Shrestha", "sita@cpn.test", "professional", { location: "Lalitpur", contactNumber: "9841000001" }),
    mk("Ramesh Adhikari", "ramesh@cpn.test", "professional", { location: "Kathmandu", contactNumber: "9841000002" }),
    mk("Anjali Gurung", "anjali@cpn.test", "professional", { location: "Pokhara", contactNumber: "9841000003" }),
    mk("Bikash Thapa", "bikash@cpn.test", "professional", { location: "Bhaktapur", contactNumber: "9841000004" }),
  ]);
  const clients = await Promise.all([
    mk("Kushal Bhatta", "client@cpn.test", "client", { location: "Kathmandu", contactNumber: "9800000001" }),
    mk("Priya Karki", "priya@cpn.test", "client", { location: "Lalitpur", contactNumber: "9800000002" }),
    mk("Nabin Rai", "nabin@cpn.test", "client", { location: "Dharan", contactNumber: "9800000003" }),
  ]);

  await ProfessionalModel.insertMany([
    {
      professionalId: pros[0]._id,
      specialization: "Architect",
      experience: "9 years",
      education: "B.Arch, Tribhuvan University (IOE Pulchowk)",
      skills: "Residential planning, Earthquake-resistant design, AutoCAD, Revit, 3D visualisation",
      description:
        "I design contemporary family homes that respect Nepali building codes and make the most of natural light. Every project includes structural coordination and a full set of municipality-ready drawings.",
    },
    {
      professionalId: pros[1]._id,
      specialization: "Civil Engineer",
      experience: "14 years",
      education: "M.Sc. Structural Engineering, Kathmandu University",
      skills: "Structural analysis, Site supervision, Cost estimation, ETABS, SAP2000",
      description:
        "Structural engineer focused on safe, cost-efficient RCC buildings. I help families get accurate estimates up front and supervise construction so the build matches the design.",
    },
    {
      professionalId: pros[2]._id,
      specialization: "Interior Designer",
      experience: "6 years",
      education: "BFA Interior Design, Nepal College of Fine Arts",
      skills: "Space planning, Modular kitchens, Lighting design, SketchUp, V-Ray",
      description:
        "I turn new builds and old apartments into warm, practical homes. Lake-side Pokhara homes and boutique hotels are my favourite projects.",
    },
    {
      professionalId: pros[3]._id,
      specialization: "Contractor",
      experience: "11 years",
      education: "Diploma in Civil Engineering, CTEVT",
      skills: "Turnkey construction, Traditional Newari brickwork, Project management",
      description:
        "Turnkey contractor building homes across the valley, with a soft spot for restoring traditional Newari architecture with modern comforts.",
    },
  ]);

  const designSpecs = [
    [0, "Courtyard Family Home", "Residential", 2400, 8500000, img(0, 4), "A two-storey family home organised around a sunlit courtyard. Four bedrooms, a double-height living room and a rooftop terrace with valley views. Designed to NBC 105 seismic standards."],
    [0, "Glass Box Villa", "Villa", 3600, 18500000, img(1, 2), "Cantilevered upper volume with floor-to-ceiling glazing, open-plan living and an infinity pool. Ideal for a sloping plot on the edge of the valley."],
    [0, "Compact Urban Townhouse", "Modern", 1250, 4800000, img(3, 6), "A narrow-lot townhouse that fits on 3.5 aana. Three bedrooms over three floors with a top-floor studio and solar water heating."],
    [1, "Earthquake-Safe Two Storey", "Residential", 1800, 6200000, img(4, 0), "A cost-efficient RCC frame home with a simple, symmetric plan for strong seismic performance. Includes full structural drawings and BOQ."],
    [1, "Five Floor Rental Apartment", "Apartment", 6500, 32000000, img(5, 3), "Ten 2BHK rental units with lift, rooftop water storage and ground-floor shops. Strong rental yield for main-road plots."],
    [1, "Commercial Office Block", "Commercial", 9000, 54000000, img(3, 1), "Four-storey office building with open floor plates, basement parking and a glass-fronted ground floor."],
    [2, "Lakeside Retreat Interior", "Interior", 1400, 2200000, img(2, 6), "Warm timber, stone and linen interior for a Pokhara holiday home. Includes custom furniture, lighting plan and modular kitchen."],
    [2, "Boutique Hotel Lobby", "Interior", 2000, 3800000, img(6, 1), "A welcoming lobby and lounge that mixes Dhaka textiles and brass with a clean contemporary layout."],
    [2, "Minimal Garden Bungalow", "Bungalow", 1600, 7200000, img(7, 5), "Single-storey bungalow with a wraparound verandah and landscaped garden, perfect for retirement living."],
    [3, "Modern Newari House", "Traditional", 2100, 9800000, img(6, 3), "Traditional exposed brick and carved wooden windows with a modern open-plan interior and solar roof."],
    [3, "Hillside Split-Level Home", "Residential", 2800, 11500000, img(0, 2), "Split-level home that steps down the hillside with every room facing the mountains. Includes retaining wall design."],
    [3, "Rooftop Garden Duplex", "Landscape", 1900, 7600000, img(4, 7), "Two-unit duplex with a shared rooftop garden, rainwater harvesting and a kitchen garden."],
  ];

  const designs = await Design.insertMany(
    designSpecs.map(([p, designName, designCategory, area, estimateCost, designImages, designDescription], i) => ({
      designName,
      designCategory,
      area,
      estimateCost,
      designImages,
      designDescription,
      user_id: pros[p]._id,
      designer_name: pros[p].username,
      createdAt: daysFromNow(-(i * 9 + 3)),
    }))
  );

  // Ratings and comments from clients.
  const ratingPlan = [5, 4, 5, 4, 3, 4, 5, 5, 4, 5, 4, 3];
  const commentPool = [
    "Love the use of natural light here. Could this work on a 4 aana plot?",
    "What would the cost be with a third floor added?",
    "Beautiful design, we're planning something similar in Lalitpur.",
    "Does the estimate include interior finishing?",
  ];
  for (const [i, design] of designs.entries()) {
    clients.forEach((c, j) => {
      if ((i + j) % 3 !== 2) design.ratings.push({ value: Math.max(1, ratingPlan[i] - (j % 2)), ratedBy: c._id.toString() });
    });
    if (i % 2 === 0) {
      const c = clients[i % clients.length];
      design.comments.push({ content: commentPool[i % commentPool.length], createdBy: c._id.toString(), commenterName: c.username });
    }
    design.recomputeRating();
    await design.save();
  }

  await Favorite.insertMany(
    [0, 1, 6, 9].map((i) => ({ userId: clients[0]._id.toString(), designId: designs[i]._id.toString() }))
  );

  // Availability and bookings.
  const slots = await Appointment.insertMany(
    pros.flatMap((p, i) => [
      { professional: p._id, date: daysFromNow(2 + i), startTime: "10:00", endTime: "13:00", location: `${p.location} office` },
      { professional: p._id, date: daysFromNow(5 + i), startTime: "14:00", endTime: "17:00", location: "Site visit / video call" },
      { professional: p._id, date: daysFromNow(9 + i), startTime: "09:00", endTime: "12:00", location: `${p.location} office` },
    ])
  );
  await Booking.insertMany([
    { appointment: slots[0]._id, professional: pros[0]._id, client: clients[0]._id, appointmentTime: "10:30", status: "confirmed", remark: "Discuss the Courtyard Family Home for our plot in Budhanilkantha." },
    { appointment: slots[3]._id, professional: pros[1]._id, client: clients[0]._id, appointmentTime: "11:00", status: "pending", remark: "Need a structural estimate for a 2.5 storey house." },
    { appointment: slots[1]._id, professional: pros[0]._id, client: clients[1]._id, appointmentTime: "15:00", status: "pending", remark: "Interested in the Glass Box Villa." },
    { appointment: slots[6]._id, professional: pros[2]._id, client: clients[2]._id, appointmentTime: "10:00", status: "cancelled", remark: "Interior for 3BHK apartment." },
  ]);

  // A conversation between the demo client and the first professional.
  const chat = await ChatModel.create({ members: [clients[0]._id.toString(), pros[0]._id.toString()] });
  const lines = [
    [clients[0], "Hi Sita! I love the Courtyard Family Home. Could it be adapted for a 5 aana plot?"],
    [pros[0], "Hi Kushal, thanks! Yes, it adapts well. We'd tighten the courtyard and move the stairs to the side."],
    [clients[0], "Great, I've booked a slot for this week so we can go over it."],
  ];
  for (const [i, [from, text]] of lines.entries()) {
    const m = await MessageModel.create({ chatId: chat._id.toString(), senderId: from._id.toString(), text, createdAt: new Date(Date.now() - (lines.length - i) * 3600e3) });
    chat.lastMessage = text;
    chat.lastMessageAt = m.createdAt;
  }
  await chat.save();

  console.log(`
Seeded demo data. All accounts use the password: ${PASSWORD}
  admin         admin@cpn.test
  professional  sita@cpn.test, ramesh@cpn.test, anjali@cpn.test, bikash@cpn.test
  client        client@cpn.test, priya@cpn.test, nabin@cpn.test
`);
};

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
