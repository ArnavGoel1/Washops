import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Customer" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    carDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: "CarDetails" }],
    price: { type: Number, default: 350 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
