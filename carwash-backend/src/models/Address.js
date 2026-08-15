import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    street: { type: String },
    houseNo: { type: String, default: "" },
    area: { type: String, default: "" },
    landmark: { type: String },
    city: { type: String, default: "Delhi" },
    pincode: { type: String, default: "110001" },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
