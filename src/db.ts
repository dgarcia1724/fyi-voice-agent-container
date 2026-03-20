import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://fyi:fyipassword@localhost:27017/fyi?authSource=admin';

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
}
