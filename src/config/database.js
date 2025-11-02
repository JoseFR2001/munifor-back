import mongoose from "mongoose";

const initDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

export default initDb;
