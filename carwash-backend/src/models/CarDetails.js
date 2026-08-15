import mongoose from "mongoose";

const carDetailsSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    model: { type: String, required: true },
    company: { type: String, required: true },
    color: { type: String },
    type: {
      type: String,
      enum: [
        "hatchback",
        "sedan",
        "suv",
        "muv",
        "coupe",
        "crossover",
        "convertible",
        "van",
        "truck",
        "other",
      ],
      default: "other",
    },
    carNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("CarDetails", carDetailsSchema);
