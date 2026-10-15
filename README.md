# 🚀 VYNK - Real-Time Web Messaging Platform

Vynk is a real-time web messaging application inspired by WhatsApp Web, built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, **Socket.IO**, **Redis**, and **MySQL with Sequelize ORM**.

---

## 📂 Project Architecture

```
vynk/
├── PLAN.md                 # Full architectural specification & UI/UX plan
├── README.md               # Quickstart and setup guide
├── backend/                # Node.js + Express + Socket.IO + Sequelize ORM
│   ├── src/
│   │   ├── config/         # Sequelize & Redis configurations
│   │   ├── models/         # User, Conversation, Message, Participant, Attachment
│   │   ├── controllers/    # Auth & Chat controllers
│   │   ├── sockets/        # Real-time Socket.io event manager
│   │   ├── routes/         # REST API endpoints & file upload
│   │   └── server.ts       # Application entry point
│   ├── .env.example
│   └── package.json
└── frontend/               # React (Vite) + TypeScript + Tailwind CSS + Zustand
    ├── src/
    │   ├── components/     # WhatsApp Web UI (Sidebar, ChatWindow, LeftRail, InputBar)
    │   ├── store/          # Zustand authStore & chatStore
    │   ├── services/       # Axios API client & Socket.io client
    │   └── types/          # Shared TypeScript interfaces
    └── package.json
```

---

## ⚡ Prerequisites

1. **Node.js**: v18+ or v20+ installed
2. **MySQL**: MySQL 8.0+ service running locally (e.g. XAMPP, MySQL Workbench, or Docker)
3. **Redis**: (Optional for single instance dev, required for clustering): Redis service running on port 6379

---

## 🛠️ Step-by-Step Setup Guide

### 1. Database Setup (MySQL)
Open your MySQL terminal or phpMyAdmin/Workbench and create the database:
```sql
CREATE DATABASE vynk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. Backend Setup
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your `.env` settings (already configured with defaults):
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=vynk_super_secret_jwt_key_2026_change_in_production

   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=vynk_db

   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   > The server will connect to MySQL, auto-synchronize the Sequelize models, initialize WebSocket listeners, and listen on `http://localhost:5000`.

---

### 3. Frontend Setup
1. Open a second terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🌟 Features Implemented

- 💬 **Instant 1-on-1 & Group Chats**: Real-time messaging powered by Socket.IO with sub-100ms latency.
- ✔️✔️ **Delivery & Read Receipts**:
  - Single tick: Sent to server.
  - Double grey tick: Delivered to recipient socket.
  - Double blue tick: Read by recipient.
- 🟢 **Live Online/Offline Presence**: Real-time status sync via Redis & WebSockets.
- ⌨️ **Live Typing Indicators**: Real-time `"typing..."` indicator in chat header and sidebar.
- 📎 **Rich Media & File Uploads**: Upload photos, videos, and documents with in-chat previews.
- 💬 **Message Quotes / Replies**: Click reply on any bubble to quote the original message.
- 👥 **Group Channels**: Create custom groups, assign admin roles, and broadcast messages.
- 🎨 **WhatsApp Web Aesthetics**: Dark mode palette (`#111b21`, `#202c33`, `#005c4b`), 3-column split view, and responsive design.