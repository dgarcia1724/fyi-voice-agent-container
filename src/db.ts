import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://fyi:fyipassword@localhost:27017/fyi?authSource=admin';
if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
  throw new Error('MONGO_URI env var is required in production');
}

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
}
