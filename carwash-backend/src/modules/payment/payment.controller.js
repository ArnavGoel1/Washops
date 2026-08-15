import Notification from "../../models/Notification.js";
import Customer from "../../models/Customer.js";
import Payment from "../../models/Payment.js";
import Schedule from "../../models/Schedule.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// POST /api/payments/checkout
export const checkout = asyncHandler(async (req, res) => {
  const { scheduleId, rate, customerId } = req.body;

  let targetCustomer = null;
  if (customerId) {
    targetCustomer = await Customer.findById(customerId);
  } else {
    targetCustomer = await Customer.findOne({ user: req.user.id });
  }

  const payment = await Payment.create({
    customer: targetCustomer ? targetCustomer._id : undefined,
    schedule: scheduleId,
    rate: rate || 350,
    status: "pending",
  });

  const populated = await Payment.findById(payment._id)
    .populate({
      path: "schedule",
      populate: { path: "car" },
    })
    .populate({
      path: "customer",
      populate: { path: "user", select: "name email phone" },
    });

  res.status(201).json(populated || payment);
});

// PATCH /api/payments/:id/status
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { new: true }
  );

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (status === "success" && payment.schedule) {
    await Schedule.findByIdAndUpdate(payment.schedule, {
      $set: { status: "completed" },
    });

    // Mark pending payment alert as read
    await Notification.updateMany(
      { payment: payment._id, type: "payment_due" },
      { $set: { read: true } }
    );

    const custObj = await Customer.findById(payment.customer).populate("user");
    const custName = custObj?.name || custObj?.user?.name || "Customer";

    // Create Payment Collected alert
    await Notification.create({
      title: "Payment Collected",
      message: "Payment of ₹" + payment.rate + " collected from " + custName + ".",
      type: "payment_collected",
      amount: payment.rate,
      customerName: custName,
      customer: payment.customer,
      payment: payment._id,
      schedule: payment.schedule,
      read: true,
    });
  }

  const populated = await Payment.findById(payment._id)
    .populate({
      path: "schedule",
      populate: { path: "car" },
    })
    .populate({
      path: "customer",
      populate: { path: "user", select: "name email phone" },
    });

  res.json(populated || payment);
});

// GET /api/payments & GET /api/payments/me
export const listMyPayments = asyncHandler(async (req, res) => {
  // Return all payments across the system with full relations populated
  const payments = await Payment.find()
    .populate({
      path: "schedule",
      populate: { path: "car" },
    })
    .populate({
      path: "customer",
      populate: { path: "user", select: "name email phone" },
    })
    .sort({ createdAt: -1 });

  res.json(payments);
});
