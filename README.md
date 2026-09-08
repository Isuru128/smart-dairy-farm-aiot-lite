# NexaDairy (pvt) Ltd. - Smart Farm AIoT Platform

## Enterprise Smart Dairy Farm Management System with AI & IoT Integration

**NexaDairy (pvt) Ltd.** is an enterprise-grade smart dairy farm management ecosystem designed for modern precision livestock operations, automated milking facilities, and real-time IoT monitoring.

The platform integrates:
- **Artificial Intelligence (AI)** for milk yield forecasting, disease risk evaluation, and feed ration optimization.
- **IoT Sensor Telemetry & Automation** with ESP32 microcontrollers, DHT22 climate sensors, ultrasonic tank sensors, and automated gate actuators.
- **Virtual IoT Hardware Simulator** allowing complete real-time end-to-end testing without physical microcontrollers.
- **Role-Based Access Control (RBAC)** & JWT token authentication.
- **Financial & Operations Management** tailored for enterprise dairy reporting (in Sri Lankan Rupees - `LKR`).

---

## Current Project Status

| Module | Status | Details |
| :--- | :---: | :--- |
| **Node.js Backend API** | ✅ **Active** | Express REST API, JWT Auth, Mongoose schemas, centralized error handling, and DNS fallback for MongoDB Atlas. |
| **React Web Dashboard** | ✅ **Active** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, fixed static sidebar, and protected routes. |
| **Admin Authentication Portal** | ✅ **Active** | High-definition split-screen landscape visual with right-side sign-in card and logout confirmation modal. |
| **Livestock Management** | ✅ **Active** | 15 registered cattle (`COW-RFID-101` – `COW-RFID-115`), breed records, health, lactation stages, and vaccination history. |
| **Milk Production & Yield** | ✅ **Active** | Milking sessions (Morning/Evening), fat & protein content tracking, and weekly aggregate analytics. |
| **IoT Sensor Telemetry** | ✅ **Active** | Live DHT22 barn climate, water levels, air quality index, and automated fan / refill relay triggers. |
| **Virtual Hardware Simulator** | ✅ **Active** | In-browser interactive simulation console + standalone CLI daemon (`npm run simulate:iot`). |
| **Smart Feeding & Grazing** | ✅ **Active** | Automated pasture gates, feeding schedules, and remote actuator triggers. |
| **AI Predictive Analytics** | ✅ **Active** | Heuristic & FastAPI yield prediction, disease risk analysis, and optimal feed ration suggestions. |
| **Inventory & Staff Operations**| ✅ **Active** | Feed stock, veterinary medication reorder levels, employee shift rosters, and task dispatching. |
| **Financial Management** | ✅ **Active** | Monthly revenue, feed expenses, cashflow analytics, and transaction logs in Sri Lankan Rupees (`LKR`). |

---

## System Architecture

```text
       [ Virtual IoT Simulator / ESP32 Physical Nodes ]
                              ↓
                [ HTTP Telemetry / MQTT Stream ]
                              ↓
              [ Node.js + Express REST Backend ]
                              ↓
             [ MongoDB Atlas Cloud Database ]
                              ↓
         [ FastAPI AI Machine Learning Microservice ]
                              ↓
            [ NexaDairy React.js Web Dashboard ]
```

---

## Technology Stack

### Frontend Web Application
- **React.js 18** (Single Page Application)
- **Vite 6** (Blazing fast build & HMR)
- **Tailwind CSS 3** (Custom glassmorphism, responsive themes)
- **Axios** (API client with JWT bearer interceptors)
- **Recharts** (Interactive production & financial trend charts)
- **Lucide React** (Modern enterprise icon pack)

### Backend API Service
- **Node.js & Express.js**
- **MongoDB Atlas & Mongoose** (With automatic DNS SRV fallback resolvers)
- **JSON Web Tokens (JWT)** for secure session handling
- **Crypto-secure secret generators**

---

## Registered Cattle Herd (`COW-RFID-101` – `COW-RFID-115`)

| Tag ID | Name | Breed | Weight | Health Status | Lactation | Barn Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `COW-RFID-101` | Bella | Holstein Friesian | 580 kg | Healthy | Early | Barn A - Stall 01 |
| `COW-RFID-102` | Daisy | Jersey | 460 kg | Lactating | Mid | Barn A - Stall 02 |
| `COW-RFID-103` | Luna | Holstein Friesian | 520 kg | Pregnant | Dry | Barn B - Maternity |
| `COW-RFID-104` | Rosie | Ayrshire | 490 kg | Healthy | Mid | Barn A - Stall 04 |
| `COW-RFID-105` | Buttercup | Jersey | 440 kg | Lactating | Early | Barn A - Stall 05 |
| `COW-RFID-106` | Molly | Holstein Friesian | 595 kg | Healthy | Early | Barn A - Stall 06 |
| `COW-RFID-107` | Clara | Brown Swiss | 560 kg | Lactating | Mid | Barn A - Stall 07 |
| `COW-RFID-108` | Ruby | Sahiwal | 480 kg | Healthy | Early | Barn A - Stall 08 |
| `COW-RFID-109` | Maple | Jersey | 450 kg | Healthy | Late | Barn A - Stall 09 |
| `COW-RFID-110` | Penny | Holstein Friesian | 610 kg | Lactating | Early | Barn A - Stall 10 |
| `COW-RFID-111` | Clover | Ayrshire | 510 kg | Pregnant | Dry | Barn B - Maternity |
| `COW-RFID-112` | Hazel | Brown Swiss | 545 kg | Healthy | Mid | Barn A - Stall 12 |
| `COW-RFID-113` | Stella | Holstein Friesian | 575 kg | Under Treatment | Late | Barn C - Isolation |
| `COW-RFID-114` | Ginger | Jersey | 430 kg | Healthy | Early | Barn A - Stall 14 |
| `COW-RFID-115` | Willow | Sahiwal | 495 kg | Healthy | Mid | Barn A - Stall 15 |

---

## Installation & Running Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Isuru128/smart-dairy-farm-aiot-lite.git
cd smart-dairy-farm-aiot-lite
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure your `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dairyfarm?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

Start the backend server:
```bash
npm start
# or for live reloading during development:
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## IoT Testing & Hardware Simulation

You can test real-time sensor streams and automated event triggers without physical hardware using either method below:

### Option A: In-Browser Virtual Hardware Console
1. Open the dashboard and navigate to **IoT Sensors** (`/iot-sensors`).
2. Click **"Start Virtual Auto-Stream"** to stream live ESP32 telemetries (DHT22 climate, water tank levels).
3. Test RFID ear tag scanning by selecting any cow from the dropdown and clicking **"Simulate Scan"**.
4. Test automated threshold triggers using **"🔥 High Temp (31.8°C)"** or **"💧 Low Water (14%)"**.

### Option B: Standalone CLI IoT Simulator
From the `backend/` directory:
```bash
npm run simulate:iot
```

---

## User Roles & Permissions

| Role | Access Level |
| :--- | :--- |
| **Admin** | Unrestricted access across all operational, financial, and hardware configurations |
| **Farm Manager** | Livestock, milking stations, IoT telemetries, feeding gates, and staff schedules |
| **Veterinarian** | Herd health profiles, quarantine logs, disease risk analysis, and vaccination entries |
| **Financial Officer**| Financial cashflow analytics, milk sales revenue, and inventory cost audits |
| **Employee** | Daily milking logs, assigned chore checklists, and gate schedule views |

---

## License & Organization

Developed for **NexaDairy (pvt) Ltd.** by Isuru Rathnayake.
All rights reserved © 2026.
