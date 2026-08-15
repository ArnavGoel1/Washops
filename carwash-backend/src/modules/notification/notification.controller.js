import Notification from "../../models/Notification.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// GET /api/notifications/me
export const listMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate("payment")
    .populate("customer")
    .populate("schedule")
    .sort({ createdAt: -1 });

  res.json(notifications);
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json(notification);
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({}, { $set: { read: true } });
  res.json({ message: "All notifications marked as read" });
});

// POST /api/notifications
export const create = asyncHandler(async (req, res) => {
  const { title, message, type, amount, customerName, customerId, paymentId } = req.body;
  const notification = await Notification.create({
    title: title || "Alert",
    message: message || "",
    type: type || "payment_due",
    amount: amount || 0,
    customerName: customerName || "",
    customer: customerId || undefined,
    payment: paymentId || undefined,
  });

  res.status(201).json(notification);
});
