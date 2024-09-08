import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://0.0.0.0:27017/library');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1)
  }
};

export default connectDB;