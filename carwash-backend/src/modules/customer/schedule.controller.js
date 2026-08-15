import Notification from "../../models/Notification.js";
import Payment from "../../models/Payment.js";
import Schedule from '../../models/Schedule.js';
import Customer from '../../models/Customer.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// POST /api/customers/me/schedules
export const createSchedule = asyncHandler(async (req, res) => {
  const { car, appointmentDate, time } = req.body;

  const customer = await Customer.findOne({ user: req.user.id });
  if (!customer) {
    return res.status(404).json({ message: 'Customer profile not found' });
  }

  const schedule = await Schedule.create({
    customer: customer._id,
    car,
    appointmentDate: appointmentDate || new Date(),
    time: time || '10:00 AM',
  });

  const populated = await Schedule.findById(schedule._id).populate('car');
  res.status(201).json(populated);
});

// GET /api/customers/me/schedules
export const listMySchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find()
    .populate('car')
    .populate({
      path: 'customer',
      populate: { path: 'user', select: 'name email phone' }
    })
    .sort({ appointmentDate: -1, createdAt: -1 });

  res.json(schedules);
});

// GET /api/customers/schedules/all
export const listAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find()
    .populate('car')
    .populate({
      path: 'customer',
      populate: { path: 'user', select: 'name email phone' }
    })
    .sort({ appointmentDate: -1, createdAt: -1 });

  res.json(schedules);
});

// PATCH /api/customers/me/schedules/:id
export const updateSchedule = asyncHandler(async (req, res) => {
  const { status, appointmentDate, time } = req.body;

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { $set: { ...(status && { status }), ...(appointmentDate && { appointmentDate }), ...(time && { time }) } },
    { new: true }
  ).populate('car');

  if (!schedule) {
    return res.status(404).json({ message: 'Schedule not found' });
  }
  res.json(schedule);
});
