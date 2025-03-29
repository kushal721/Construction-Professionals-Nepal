import monggose from "mongoose";

const connectDb = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "construction-professionals-nepal",
    };
    await monggose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("Database Connected Successfully ");
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
