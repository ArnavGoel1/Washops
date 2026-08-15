import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'CarDetails', required: true },
    appointmentDate: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Schedule', scheduleSchema);
