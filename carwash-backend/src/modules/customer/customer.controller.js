import Notification from "../../models/Notification.js";
import Payment from "../../models/Payment.js";
import Customer from "../../models/Customer.js";
import Address from "../../models/Address.js";
import CarDetails from "../../models/CarDetails.js";
import User from "../../models/User.js";
import Schedule from "../../models/Schedule.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// GET /api/customers
export const listCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find()
    .populate("address")
    .populate("carDetails")
    .populate("user", "name email role phone")
    .sort({ createdAt: -1 });
  res.json(customers);
});

// GET /api/customers/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user.id })
    .populate("address")
    .populate("carDetails")
    .populate("user", "name email role phone");

  if (!customer) {
    return res.status(404).json({ message: "Customer profile not found" });
  }
  res.json(customer);
});

// GET /api/customers/:id
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .populate("address")
    .populate("carDetails")
    .populate("user", "name email role phone");

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const schedules = await Schedule.find({ customer: customer._id }).populate(
    "car"
  );
  res.json({ customer, schedules });
});

// POST /api/customers (Create new customer directly in customers collection)
export const createCustomer = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    cars,
    carType,
    carModel,
    carCompany,
    carNumber,
    schedule,
    time,
    price,
    notes,
  } = req.body;

  // 1. Create the customer document directly in the 'customers' collection
  const customer = await Customer.create({
    name: name || "Customer",
    phone: phone || "",
    email: email || "",
    price: price ? Number(price) : 350,
    notes: notes || "",
  });

  // 2. Create address if provided
  if (address) {
    const addressDoc = await Address.create({
      street: address,
      houseNo: address,
      area: address,
      city: "Delhi",
      pincode: "110001",
      customer: customer._id,
    });
    customer.address = addressDoc._id;
  }

  const validTypes = [
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
  ];

  // 3. Resolve and create all cars for this customer
  let carsToCreate = [];
  if (Array.isArray(cars) && cars.length > 0) {
    carsToCreate = cars;
  } else if (carType || carModel || carNumber) {
    carsToCreate = [{ type: carType, model: carModel, company: carCompany, carNumber }];
  } else {
    carsToCreate = [{ type: "sedan", model: "Sedan" }];
  }

  const createdSchedules = [];

  for (const c of carsToCreate) {
    const rawType = (c.type || "other").toLowerCase().trim();
    const safeType = validTypes.includes(rawType) ? rawType : "other";

    const carDoc = await CarDetails.create({
      customer: customer._id,
      type: safeType,
      model: c.model || c.type || "Sedan",
      company: c.company || "Standard",
      carNumber:
        c.carNumber ||
        ("DL " +
          Math.floor(10 + Math.random() * 89) +
          " " +
          Math.floor(1000 + Math.random() * 8999)),
    });

    customer.carDetails.push(carDoc._id);

    // 4. Create Schedule appointment for this vehicle
    const scheduleDoc = await Schedule.create({
      customer: customer._id,
      car: carDoc._id,
      appointmentDate: new Date(),
      time: time || "10:00 AM",
      status: "pending",
    });

    // 5. Create Payment record for this schedule
    const paymentDoc = await Payment.create({
      customer: customer._id,
      schedule: scheduleDoc._id,
      rate: customer.price || 350,
      status: "pending",
    });

    // Create automatic Payment Collection Alert
    await Notification.create({
      title: "Payment Due",
      message: "Payment of ₹" + (customer.price || 350) + " is due from " + customer.name + " for " + (c.model || "car") + " wash.",
      type: "payment_due",
      amount: customer.price || 350,
      customerName: customer.name,
      customer: customer._id,
      payment: paymentDoc._id,
      schedule: scheduleDoc._id,
    });

    createdSchedules.push(scheduleDoc);
  }

  await customer.save();

  const populated = await Customer.findById(customer._id)
    .populate("address")
    .populate("carDetails");

  res.status(201).json({ customer: populated, schedules: createdSchedules });
});

// PUT /api/customers/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, price } = req.body;

  const customer = await Customer.findOneAndUpdate(
    { user: req.user.id },
    { $set: { ...(name && { name }), ...(phone && { phone }), ...(price !== undefined && { price }) } },
    { new: true }
  );

  if (!customer) {
    return res.status(404).json({ message: "Customer profile not found" });
  }
  res.json(customer);
});

// POST /api/customers/me/address
export const addAddress = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user.id });
  if (!customer) {
    return res.status(404).json({ message: "Customer profile not found" });
  }

  const address = await Address.create({ ...req.body, user: req.user.id, customer: customer._id });
  customer.address = address._id;
  await customer.save();

  res.status(201).json(address);
});

// POST /api/customers/me/cars
export const addCar = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user.id });
  if (!customer) {
    return res.status(404).json({ message: "Customer profile not found" });
  }

  const car = await CarDetails.create({ ...req.body, customer: customer._id });
  customer.carDetails.push(car._id);
  await customer.save();

  res.status(201).json(car);
});

// GET /api/customers/me/cars
export const listMyCars = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user.id });
  if (!customer) {
    return res.status(404).json({ message: "Customer profile not found" });
  }
  const cars = await CarDetails.find({ customer: customer._id });
  res.json(cars);
});
