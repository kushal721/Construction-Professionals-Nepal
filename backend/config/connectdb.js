import mongoose from "mongoose";

const connectDb = async (DATABASE_URL) => {
  await mongoose.connect(DATABASE_URL, {
    dbName: process.env.DATABASE_NAME || "construction-professionals-nepal",
  });
  console.log("Database connected");
};

export default connectDb;
