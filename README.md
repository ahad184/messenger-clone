# 🗨️ Messenger Clone - Full Stack Real-Time Chat App

A modern, real-time chat application inspired by Facebook Messenger. Built with **React, Node.js, Socket.IO, and MongoDB**.

## ✨ Features

- **Real-Time Messaging**: Instant message delivery using Socket.IO.
- **Authentication**: Secure JWT-based login and registration.
- **User Search**: Find and start chats with other registered users.
- **Image Sharing**: Send and view images in chats (powered by Multer).
- **Online/Offline Status**: Real-time presence indicators.
- **Typing Indicators**: Visual feedback when someone is typing.
- **Seen Status**: Know when your messages have been read.
- **Responsive Design**: Optimized for both desktop and mobile views.
- **Messenger UI**: Premium dark-mode aesthetic with smooth animations.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Zustand (State Management)
- Socket.IO Client
- React Router Dom
- Axios

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO Server
- JWT (Authentication)
- Multer (Image Uploads)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally on `mongodb://localhost:27017` or atlas URI)

### 1. Setup Backend
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` folder (or use the provided one):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/messenger-clone
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```
- Start the backend:
```bash
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```
- Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_UPLOAD_URL=http://localhost:5000
```
- Start the frontend:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
messenger-clone/
├── backend/
│   ├── controllers/    # API logic
│   ├── middleware/     # Auth & Upload guards
│   ├── models/        # Mongoose schemas
│   ├── routes/         # Express endpoints
│   ├── socket/         # Socket.IO handlers
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios config
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom hooks (Socket)
│   │   ├── pages/      # View pages
│   │   ├── store/      # Zustand state
│   │   └── App.jsx     # Routing
│   └── index.html
└── README.md
```

## 📜 Authors
- Created by Antigravity AI
