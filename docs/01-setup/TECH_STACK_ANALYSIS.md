# 📊 PHÂN TÍCH STACK CÔNG NGHỆ - DỰ ÁN WEBSITE HỌC TIẾNG ANH

## 🎯 Tổng quan dự án

**Tên dự án:** English Learning Platform with AI
**Architecture:** Full-stack Web Application (Client-Server)
**Repository:** DoHungMinh/website-hoc-tieng-anh
**Version:** 1.0.0

---

## 🔧 BACKEND

### Ngôn ngữ & Runtime
- **Ngôn ngữ chính:** TypeScript 5.3.3
- **Runtime:** Node.js (ES2020)
- **Compiled to:** JavaScript (CommonJS) trong folder `dist/`

### Framework & Core Libraries
```
Express.js 4.18.2         - Web framework
Mongoose 8.0.3            - MongoDB ODM
Socket.IO 4.7.4           - Real-time communication
```

### Database
```
MongoDB (MongoDB Atlas)   - NoSQL Database
Connection: mongoose với async/await
```

### AI & Machine Learning
```
OpenAI API 4.104.0        - GPT-4o-mini
Features:
  - Chatbot AI
  - IELTS test generation
  - Content creation
```

### Authentication & Security
```
JWT (jsonwebtoken 9.0.2)  - Token-based auth
bcryptjs 2.4.3            - Password hashing
helmet 7.1.0              - Security headers
express-rate-limit 7.1.5  - Rate limiting
cors 2.8.5                - CORS handling
```

### File Upload & Storage
```
Multer 1.4.5              - File upload middleware
Cloudinary 2.7.0          - Cloud storage (images, audio)
```

### Payment Integration
```
@payos/node 2.0.3         - PayOS payment gateway
```

### Email Service
```
Nodemailer 6.10.1         - Email sending
SMTP configuration
```

### Validation & Utilities
```
Joi 17.11.0               - Data validation
dotenv 16.3.1             - Environment variables
compression 1.7.4         - Response compression
axios 1.12.2              - HTTP client
```

### Development Tools
```
TypeScript 5.3.3          - Type checking
ts-node 10.9.1            - TS execution
nodemon 3.0.2             - Auto-restart
ESLint 8.54.0             - Code linting
Jest 29.7.0               - Testing
```

### TypeScript Configuration
```json
{
  "target": "ES2020",
  "module": "commonjs",
  "outDir": "./dist",
  "rootDir": "./src",
  "strict": true
}
```

### Build Process
```bash
npm run dev    # Development với nodemon
npm run build  # Compile TS → JS (dist/)
npm start      # Production (node dist/server.js)
```

### Project Structure (Backend)
```
backend/
├── src/                    # TypeScript source code
│   ├── server.ts          # Entry point
│   ├── controllers/       # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── utils/             # Helper functions
├── dist/                  # Compiled JavaScript
├── config/                # Configuration
├── scripts/               # Utility scripts
└── package.json
```

---

## 💻 FRONTEND

### Ngôn ngữ & Framework
- **Ngôn ngữ:** TypeScript 5.5.3
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.2

### UI Framework & Styling
```
Tailwind CSS 3.4.1        - Utility-first CSS
PostCSS 8.4.35            - CSS processing
Autoprefixer 10.4.18      - CSS vendor prefixes
Framer Motion 10.16.16    - Animations
Lucide React 0.344.0      - Icon library
```

### Routing & Navigation
```
React Router DOM 6.20.1   - Client-side routing
```

### State Management
```
Zustand 4.4.7             - Global state management
React Query 3.39.3        - Server state management
React Hook Form 7.48.2    - Form state management
```

### HTTP & Real-time
```
Axios 1.6.2               - HTTP client
Socket.IO Client 4.7.4    - WebSocket client
```

### Data Visualization
```
Chart.js 4.5.0            - Chart library
React ChartJS 2 5.3.0     - React wrapper
```

### UI Components & UX
```
React Hot Toast 2.4.1     - Notifications
@tailwindcss/line-clamp   - Text truncation
```

### Development Tools
```
TypeScript 5.5.3          - Type checking
ESLint 9.9.1              - Code linting
Vite 5.4.2                - Fast build tool
@vitejs/plugin-react      - React support
```

### TypeScript Configuration
```json
{
  "target": "ES2020",
  "module": "ESNext",
  "jsx": "react-jsx",
  "moduleResolution": "bundler",
  "strict": true
}
```

### Build Process
```bash
npm run dev      # Development server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
```

### Project Structure (Frontend)
```
frontend/
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Root component
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static assets
├── index.html             # HTML template
└── package.json
```

---

## 🔄 COMMUNICATION FLOW

### API Communication
```
Frontend (React) → Vite Proxy → Backend (Express)
http://localhost:5173/api/* → http://localhost:5002/api/*
```

### Real-time Communication
```
Frontend (Socket.IO Client) ↔ Backend (Socket.IO Server)
- Admin dashboard updates
- User activity tracking
- Real-time notifications
```

### Authentication Flow
```
1. User login → Backend JWT token
2. Token stored in localStorage
3. Axios interceptor adds token to headers
4. Backend middleware validates token
```

---

## 🗄️ DATABASE

### MongoDB (MongoDB Atlas)
```
Connection: mongoose 8.0.3
Database: english_learning_web
Collections:
  - users
  - courses
  - ieltsexams
  - ieststestresults
  - progresses
  - chatsessions
  - assessments
  - enrollments
```

### Schema Management
```
Location: backend/src/models/
Type: Mongoose schemas with TypeScript interfaces
```

---

## 🚀 DEPLOYMENT & PRODUCTION

### Environment Variables
```
Backend (.env):
  - MONGODB_URI
  - JWT_SECRET
  - OPENAI_API_KEY
  - CLOUDINARY_*
  - PAYOS_*
  - EMAIL_*

Frontend:
  - Vite proxy config
  - API endpoints
```

### Ports
```
Backend:  5002
Frontend: 5173 (dev), 4173 (preview)
Database: MongoDB Atlas (cloud)
```

---

## 📊 KEY FEATURES BY TECHNOLOGY

### TypeScript (Both)
- ✅ Type safety
- ✅ IntelliSense support
- ✅ Better refactoring
- ✅ Interface definitions

### React + Vite (Frontend)
- ⚡ Fast HMR (Hot Module Replacement)
- 📦 Optimized builds
- 🎨 Component-based UI
- 🔄 Efficient re-rendering

### Express + MongoDB (Backend)
- 🚀 RESTful API
- 📊 Flexible schema
- 🔐 Middleware-based security
- 📈 Scalable architecture

### OpenAI Integration
- 🤖 AI Chatbot
- 📝 IELTS test generation
- 💬 Natural language processing
- 🎓 Educational content

### Socket.IO (Both)
- 🔴 Real-time updates
- 👥 Multi-user support
- 📡 Bidirectional communication
- 🔄 Auto-reconnection

---

## 💪 STRENGTHS

### Technical Advantages
1. **Full TypeScript Stack** - Type safety từ frontend đến backend
2. **Modern Tools** - Vite, React 18, Express latest
3. **AI Integration** - OpenAI GPT-4o-mini
4. **Real-time Features** - Socket.IO
5. **Scalable Architecture** - Modular, separation of concerns
6. **Security** - JWT, bcrypt, helmet, rate limiting
7. **Payment Integration** - PayOS
8. **Cloud Storage** - Cloudinary

### Development Experience
- ⚡ Fast development with HMR
- 🔧 TypeScript IntelliSense
- 🧪 Testing setup (Jest)
- 📝 ESLint code quality
- 🔄 Auto-restart (nodemon)

---

## 📈 TECHNOLOGY STACK SUMMARY

```
┌─────────────────────────────────────┐
│         FRONTEND (Client)           │
│  React 18 + TypeScript + Vite       │
│  Tailwind + Zustand + React Query   │
│  Port: 5173                         │
└──────────────┬──────────────────────┘
               │
               │ HTTP (Axios) + WebSocket (Socket.IO)
               │
┌──────────────▼──────────────────────┐
│         BACKEND (Server)            │
│  Node.js + TypeScript + Express     │
│  MongoDB + OpenAI + Socket.IO       │
│  Port: 5002                         │
└──────────────┬──────────────────────┘
               │
               │ Mongoose ODM
               │
┌──────────────▼──────────────────────┐
│         DATABASE                    │
│  MongoDB Atlas (Cloud)              │
│  NoSQL Document Store               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    EXTERNAL SERVICES                │
│  - OpenAI API (GPT-4o-mini)        │
│  - Cloudinary (File storage)        │
│  - PayOS (Payment)                  │
│  - SMTP (Email)                     │
└─────────────────────────────────────┘
```

---

## 🎯 CONCLUSION

**Dự án của bạn sử dụng:**

### BACKEND:
- **Ngôn ngữ:** TypeScript (compiled to JavaScript)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **AI:** OpenAI GPT-4o-mini

### FRONTEND:
- **Ngôn ngữ:** TypeScript + JSX
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand + React Query

### ARCHITECTURE:
- **Pattern:** MVC (Model-View-Controller)
- **Communication:** REST API + WebSocket
- **Authentication:** JWT
- **Deployment:** Full-stack TypeScript

**Đây là một stack công nghệ hiện đại, professional và scalable!** 🚀
