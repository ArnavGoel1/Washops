# 🚗 WashOps — Car Wash Operations & Fleet Management

> **A modern, mobile-first operations management application designed for independent car wash businesses.**
> Built with **React Native (Expo)**, **Node.js (Express)**, and **MongoDB**.

---

## 📌 Project Overview

**WashOps** solves a major pain point for small, independent car wash operators who still manage daily jobs, customer records, multi-vehicle fleets, and payment collections using paper notebooks, memory, and chaotic phone contact lists.

WashOps provides a unified mobile platform where operators can:
- 👥 Manage customers and their entire multi-vehicle fleet in one place.
- 📅 Schedule washes and view daily queues with an interactive weekly calendar strip.
- 💰 Track revenue, pending dues, and record cash/UPI payments with a single tap.
- 🔔 Receive real-time in-app alerts for pending payment collections and completed services.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React Native (Expo)** | Cross-platform mobile app (iOS, Android, Web) with TypeScript and Expo Router. |
| **Backend** | **Node.js + Express** | Modular REST API with JWT authentication and async controller error handling. |
| **Database** | **MongoDB + Mongoose** | Document-oriented database for nested customer fleets, appointments, and payments. |
| **Security** | **Bcrypt + JWT + SecureStore** | Encrypted password hashing and persistent token management. |

---

## ✨ Core Features

### 1. 🔐 Operator Authentication & Security
- Secure **Sign Up** and **Login** with encrypted password storage (`bcrypt`).
- JWT-based authorization header management.
- Persistent session storage using `expo-secure-store` for instant app re-entry.

### 2. 👥 Customer & Multi-Car Fleet Management
- Create customer profiles with direct phone numbers, parking/residential addresses, and special notes.
- **Multi-Car Support**: Add multiple vehicles per customer (Make, Model, License Plate Number, and Body Style: *Sedan, SUV, MUV, Hatchback, Coupe, etc.*) using the dynamic `+ Add Car` builder.
- Real-time customer search by name or phone number.
- Detailed customer profiles with registered fleet cards, monthly plan rates, and past wash history.

### 3. 📅 Wash Scheduling & Weekly Calendar
- **Interactive 7-Day Calendar Strip**: Real-time date selector with daily wash count badges and a "Today" quick-jump button.
- **Status Workflows**: Live status transitions (`PENDING` $\rightarrow$ `IN PROGRESS` $\rightarrow$ `COMPLETED`) with 1-tap action buttons directly on appointment cards.
- Filter appointments by status: `ALL`, `PENDING`, `IN PROGRESS`, `COMPLETED`.

### 4. 💵 Payments & Revenue Tracking
- Real-time **Total Collected Revenue** and **Pending Receivables** calculation.
- **1-Tap Payment Collection**: Tap *"Collect ₹Rate"* on any pending order to instantly record payment in MongoDB and update revenue totals.
- Searchable transaction ledger with customer names, vehicle models, timestamps, and status badges.

### 5. ⚡ Operations Dashboard
- Operator welcome header with active shift stats.
- Visual daily wash progress bar (`Completed / Total`).
- Quick-action shortcuts to add new customers and view the customer directory.
- **Active Queue**: Live appointment cards with direct completion checkmark actions.

### 6. 🔔 Real-Time Payment Due & Service Alerts
- Automated alert triggers when new washes are booked or services completed without payment.
- Direct **"Collect ₹..."** button inside alert cards.
- Quick filter tabs: `ALL`, `DUE`, `COLLECTED` with unread badge indicators.

---

## 🗄️ Database Architecture & Collections

The MongoDB database (`carwash`) separates authentication credentials from client records:

```text
📁 carwash (MongoDB Database)
   ├── 📄 users          👉 App accounts & credentials (name, email, passwordHash, role)
   ├── 📄 customers      👉 Client profiles (name, phone, email, address, price, notes)
   ├── 📄 cardetails     👉 Registered vehicle fleets (model, company, carNumber, type)
   ├── 📄 schedules      👉 Wash appointments (customer, car, appointmentDate, time, status)
   ├── 📄 payments       👉 Revenue & transactions (customer, schedule, rate, status)
   └── 📄 notifications  👉 Real-time payment due & collection alerts
```

---

## 🔌 API Endpoints Reference

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register a new operator account.
- `POST /api/auth/login` — Login with email and password to receive JWT.
- `GET  /api/auth/validate` — Validate existing session token.

### 👥 Customers & Fleet (`/api/customers`)
- `GET  /api/customers` — List all customers with populated cars and addresses.
- `POST /api/customers` — Create a customer with multiple cars, schedules, and initial payments.
- `GET  /api/customers/:id` — Get detailed customer profile and complete wash history.

### 📅 Wash Schedules (`/api/customers/me/schedules`)
- `GET   /api/customers/me/schedules` — Fetch all scheduled appointments.
- `POST  /api/customers/me/schedules` — Book a new wash appointment.
- `PATCH /api/customers/me/schedules/:id` — Update appointment status (`pending`, `in_progress`, `completed`).

### 💳 Payments (`/api/payments`)
- `GET   /api/payments/me` — List all payment transactions with customer & car details.
- `PATCH /api/payments/:id/status` — Update payment status to `success` (collected) or `pending`.

### 🔔 Notifications & Alerts (`/api/notifications`)
- `GET   /api/notifications/me` — List all payment and service alerts.
- `PATCH /api/notifications/:id/read` — Mark a specific notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas on `mongodb://127.0.0.1:27017/carwash`)
- **Expo CLI** (`npx expo`)

---

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd carwash-backend

# Install dependencies
npm install

# Configure environment variables (.env)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/carwash
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

---

### 3. Frontend Setup
```bash
# In the root project directory
cd ..

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

- Press **`i`** to run on **iOS Simulator**.
- Press **`a`** to run on **Android Emulator**.
- Press **`w`** to run in **Web Browser**.
- Or scan the QR code with the **Expo Go** app on a physical device.

---

## 🎯 Out of Scope for Current Version (Phase 1)

The following features are intentionally reserved for future releases to focus on core operational speed:
- External OS-level push notifications (FCM / APNs) and automated SMS/WhatsApp customer reminders.
- Comparative revenue analytics trend charts, forecasting, and exportable financial reports.
- Automated third-party payment gateway recurring auto-debit (e.g., Stripe/Razorpay).
- Multi-operator technician accounts with role-based permissions (RBAC).
- Separate customer-facing booking portal.
- GPS route optimization and consumable chemical inventory tracking.

---

## 👨‍💻 Author & Acknowledgements

- **Developer**: **Arnav Goel**
- **Context**: Built during the **Talking Crooks internship**
- **License**: MIT
