import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["payment_due", "payment_collected", "booking", "payment", "system"],
      default: "payment_due",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    amount: { type: Number, default: 0 },
    customerName: { type: String, default: "" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
