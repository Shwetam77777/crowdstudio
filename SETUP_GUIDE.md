# 🎵 CrowdStudio - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file in the backend directory:**
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_change_in_production_12345"
JWT_EXPIRY="7d"
CORS_ORIGIN="http://localhost:3000"
```

4. **Run database migrations:**
```bash
npx prisma migrate dev --name init
```

5. **Generate Prisma client:**
```bash
npx prisma generate
```

6. **Start the backend server:**
```bash
npm run dev
```

Backend will be running at: http://localhost:4000

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend-web
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env.local` file in the frontend-web directory:**
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

4. **Start the frontend server:**
```bash
npm run dev
```

Frontend will be running at: http://localhost:3000

## ✨ New Features Added

### 1. AI Music Generation
- Navigate to `/ai-generate` to create AI-generated songs
- Input lyrics, choose genre, and generate music
- AI-generated songs are marked with a special badge

### 2. Comments & Reviews System
- Users can comment on songs
- Optional 1-5 star rating system
- Delete your own comments
- View all comments on song detail pages

### 3. Enhanced Global Ranking
- Beautiful leaderboard with top 3 medals (🥇🥈🥉)
- Statistics dashboard showing total songs, likes, and comments
- Rank badges on song cards
- Improved visual hierarchy

### 4. Improved UI/UX
- Modern gradient designs
- Smooth animations and transitions
- Better responsive layout
- Enhanced theme switching
- Glass morphism effects
- Improved login/register pages

## 🎨 Features Overview

### AI Generation Page (`/ai-generate`)
- Input custom lyrics
- Select music genre (pop, rock, jazz, etc.)
- Optional title input
- Real-time word/line counter
- Loading state with progress indicator

### Global Leaderboard (`/`)
- Top ranked songs with visual medals
- Total statistics (songs, likes, comments)
- AI-generated badge on cards
- Genre tags
- Quick access to AI generation

### Song Detail Page (`/songs/[id]`)
- Full song information with lyrics
- Audio player integration
- Comments section with ratings
- Like button
- Beautiful gradient layouts

### Comments System
- Leave text comments
- Optional 1-5 star ratings
- View all comments sorted by date
- Delete own comments
- User attribution

## 📱 User Roles

### Audience
- View and like songs
- Comment on songs with ratings
- Generate AI music

### Producer
- All audience features
- Access to dashboard
- Create manual songs
- View own songs

## 🎯 Database Schema Updates

New fields added to Song model:
- `lyrics` - Store song lyrics
- `genre` - Music genre
- `aiGenerated` - Flag for AI-generated songs

New Comment model:
- `content` - Comment text
- `rating` - Optional 1-5 star rating
- `userId` - Comment author
- `songId` - Associated song
- `createdAt` - Timestamp

## 🔧 API Endpoints

### New AI Endpoints
```
POST /ai/generate
- Generate AI music from lyrics
- Body: { lyrics, genre?, title? }
- Requires authentication
```

### New Comment Endpoints
```
GET /songs/:id/comments
- Get all comments for a song

POST /songs/:id/comments
- Create a comment
- Body: { content, rating? }
- Requires authentication

DELETE /comments/:id
- Delete your own comment
- Requires authentication
```

### Updated Song Endpoints
All song endpoints now include:
- `lyrics`, `genre`, `aiGenerated` fields
- `commentCount` in responses

## 🎨 UI Enhancements

### Color Scheme
- Primary: Purple (#9333EA) to Blue (#2563EB) gradients
- Accents: Pink, Red (for likes), Blue (for comments)
- Backgrounds: Multi-color gradients

### Animations
- Fade-in on page load
- Shake on errors
- Hover transformations
- Smooth transitions

### Components
- Enhanced SongCard with rank badges
- CommentsSection with star ratings
- Improved Navbar with gradient logo
- Modern form inputs with better focus states

## 🚨 Troubleshooting

### Database Issues
If you get database errors:
```bash
cd backend
npx prisma migrate reset --force
npx prisma migrate dev --name init
npx prisma generate
```

### Port Already in Use
Change the PORT in backend `.env` file or kill the process:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill
```

### Module Not Found
Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎉 Getting Started Tips

1. **Create an account** as a "Producer" to access all features
2. **Generate your first AI song** at `/ai-generate`
3. **Explore the leaderboard** to see top songs
4. **Leave comments and ratings** on songs you like
5. **Try different themes** (Light, Dark, Neon)

## 📝 Notes

- The AI music generation currently uses sample audio URLs
- To integrate with real AI APIs (Suno, Mubert, OpenAI), update `backend/src/routes/ai.ts`
- The app uses SQLite for development (file-based database)
- For production, consider using PostgreSQL or MySQL

## 🔐 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- CORS protection enabled
- Input validation on all endpoints

## 🌐 Deployment

Refer to the main README.md for Vercel (frontend) and Render (backend) deployment instructions.

---

**Enjoy creating music with CrowdStudio! 🎵**
