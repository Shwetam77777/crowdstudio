# 🎵 CrowdStudio - AI Music Collaboration Platform

> **Collaborate with the crowd on AI-generated music. Create, share, and vote on AI-generated songs in real-time.**

[![GitHub](https://img.shields.io/badge/GitHub-Shwetam77777-blue?style=flat-square&logo=github)](https://github.com/Shwetam77777/crowdstudio)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=flat-square)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**CrowdStudio** is a full-stack AI music generation platform that enables:
- Users to generate AI songs using custom lyrics
- Community voting and ranking system
- User authentication and role management
- Top songs leaderboard with real-time updates
- Theme customization (Light, Dark, Neon modes)

Perfect for music enthusiasts, creators, and AI enthusiasts!

---

## ✨ Features

### 🎤 Core Features
- **AI Music Generation** - Create songs from custom lyrics
- **User Authentication** - Secure JWT-based authentication
- **Community Voting** - Like and rank songs by the community
- **Top Songs Leaderboard** - Browse the most popular AI-generated songs
- **User Roles** - Support for different user types (audience, creator, admin)
- **Theme System** - Light, Dark, and Neon theme options

### 🔧 Technical Features
- **Full-Stack TypeScript** - Type-safe codebase
- **Real-time Database** - SQLite with Prisma ORM
- **Modern UI** - Next.js 14 with TailwindCSS
- **JWT Authentication** - Secure token-based auth
- **RESTful API** - Clean and documented endpoints
- **CORS Enabled** - Cross-origin request support

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** SQLite + Prisma ORM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs for password hashing
- **Server:** Nodemon for development

### **Frontend**
- **Framework:** Next.js 14
- **Language:** TypeScript + React 18
- **Styling:** TailwindCSS + PostCSS
- **HTTP Client:** Axios
- **State:** React hooks (useState, useContext)
- **UI Components:** Custom components

### **DevOps**
- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Environment:** .env configuration

---

## 📁 Project Structure

```
crowdstudio/
├── backend/
│   ├── src/
│   │   ├── config.ts              # Configuration management
│   │   ├── db.ts                  # Prisma database client
│   │   ├── index.ts               # Express app entry point
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT authentication middleware
│   │   ├── utils/
│   │   │   ├── jwt.ts             # JWT utilities (sign, verify)
│   │   │   └── password.ts        # Password utilities (hash, compare)
│   │   └── routes/
│   │       ├── health.ts          # Health check endpoint
│   │       ├── auth.ts            # Authentication routes
│   │       └── songs.ts           # Songs CRUD & voting routes
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── package.json               # Backend dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── .env                       # Environment variables
│   └── .gitignore
│
├── frontend-web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout wrapper
│   │   │   ├── page.tsx           # Home page (top songs)
│   │   │   ├── globals.css        # Global styles
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Login/Register page
│   │   │   └── songs/
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Individual song page
│   │   ├── components/
│   │   │   ├── ThemeProvider.tsx  # Theme context provider
│   │   │   ├── Navbar.tsx         # Navigation bar
│   │   │   └── SongCard.tsx       # Reusable song card component
│   │   └── lib/
│   │       └── api.ts             # API client & types
│   ├── public/                    # Static assets
│   ├── package.json               # Frontend dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── tailwind.config.ts         # TailwindCSS configuration
│   ├── postcss.config.mjs         # PostCSS configuration
│   ├── next.config.mjs            # Next.js configuration
│   ├── .env.local                 # Environment variables
│   └── .gitignore
│
├── README.md                      # This file
├── .gitignore                     # Git ignore rules
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A **GitHub account** (for version control)

### Installation

#### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/Shwetam77777/crowdstudio.git
cd crowdstudio
```

#### 2️⃣ **Install Backend Dependencies**

```bash
cd backend
npm install
```

#### 3️⃣ **Install Frontend Dependencies**

```bash
cd ../frontend-web
npm install
```

### Environment Setup

#### **Backend (.env)**

Create `.env` file in the `backend/` folder:

```bash
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_change_in_production_12345"
JWT_EXPIRY="7d"
CORS_ORIGIN="http://localhost:3000"
```

#### **Frontend (.env.local)**

Create `.env.local` file in the `frontend-web/` folder:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

### Running Locally

#### **Terminal 1 - Start Backend**

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Database connected
✓ Server running on http://localhost:4000 [development]
```

#### **Terminal 2 - Start Frontend**

```bash
cd frontend-web
npm run dev
```

Expected output:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

#### **Open in Browser**

Visit: **http://localhost:3000**

---

## 📦 Deployment

### **Option 1: Deploy Frontend on Vercel (RECOMMENDED)**

**Vercel is the official Next.js hosting platform - FREE tier available!**

#### Steps:

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign up"** → Use GitHub account
3. Click **"Import Project"**
4. Paste: `https://github.com/Shwetam77777/crowdstudio`
5. Select **Frontend Configuration**:
   - Framework: **Next.js**
   - Root Directory: **frontend-web**
6. Set Environment Variables:
   - `NEXT_PUBLIC_API_BASE` = `https://your-backend-url.com`
7. Click **"Deploy"** ✓

**Your frontend is LIVE in 2 minutes!** 🎉

### **Option 2: Deploy Backend on Render (FREE)**

**Render provides free PostgreSQL and Node.js hosting!**

#### Steps:

1. Go to [render.com](https://render.com)
2. Click **"Sign up"** → Use GitHub account
3. Click **"New +"** → **"Web Service"**
4. Connect repository: `Shwetam77777/crowdstudio`
5. Configure:
   - **Name:** `crowdstudio-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   ```
   PORT=4000
   NODE_ENV=production
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_production_secret_key"
   JWT_EXPIRY="7d"
   CORS_ORIGIN="https://your-frontend-url.com"
   ```
7. Click **"Create Web Service"** ✓

### **Option 3: Deploy Both on Railway (PREMIUM)**

Railway offers a simple all-in-one deployment platform.

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select `crowdstudio` repository
4. Add services for backend and frontend
5. Configure environment variables
6. Deploy ✓

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:4000  (Development)
https://api.yourdomain.com  (Production)
```

### **Authentication Endpoints**

#### **Register User**
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "audience"  // or "creator", "admin"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "audience"
  }
}
```

#### **Login User**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "audience"
  }
}
```

### **Songs Endpoints**

#### **Get Top Songs**
```
GET /songs/top

Response:
{
  "songs": [
    {
      "id": 1,
      "title": "Beautiful Sunset",
      "description": "A serene ambient track",
      "audioUrl": "https://...",
      "ownerEmail": "creator@example.com",
      "ownerId": 2,
      "likeCount": 42,
      "createdAt": "2025-12-25T10:30:00Z"
    }
  ]
}
```

#### **Get Song by ID**
```
GET /songs/:id

Response: [Single song object]
```

#### **Create Song**
```
POST /songs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My AI Song",
  "description": "Created with CrowdStudio",
  "audioUrl": "https://example.com/audio.mp3"
}

Response: [New song object]
```

#### **Like a Song**
```
POST /songs/:id/like
Authorization: Bearer {token}

Response:
{
  "ok": true
}
```

### **Health Check**
```
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2025-12-25T10:30:00Z"
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 💬 Support

Have questions or issues? 

- **GitHub Issues:** [Open an issue](https://github.com/Shwetam77777/crowdstudio/issues)
- **Email:** shwetam77777@gmail.com

---

## 🔮 Roadmap

- [ ] AI integration with OpenAI/Gemini API
- [ ] Real-time audio streaming
- [ ] Collaborative song editing
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Blockchain-based rewards system
- [ ] Premium subscription model

---

## 🌟 Show Your Support

If you find this project helpful, please:
- ⭐ Star the repository
- 📢 Share with friends
- 🐛 Report bugs and suggest features
- 📝 Create pull requests

---

**Made with ❤️ by [Shwetam77777](https://github.com/Shwetam77777)**

**Last Updated:** December 25, 2025
