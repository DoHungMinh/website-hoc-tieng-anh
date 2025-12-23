# EngPro - English Learning Platform with AI Chatbot

EngPro is a comprehensive online English learning platform featuring an intelligent AI Chatbot, proficiency assessment systems, and adaptive learning lessons.

## Project Status

- **Frontend**: Completed - React + TypeScript + Vite + Tailwind CSS
- **Backend Structure**: Completed - Node.js + Express + MongoDB (MVC)
- **Components**: Completed - UI/UX components and features
- **Development Environment**: Ready - Dev server running at http://localhost:5173
- **Package Management**: Completed - NPM workspaces for monorepo

## Project Architecture

```
website-hoc-tieng-anh/
├── frontend/                     # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── assessment/       # Proficiency assessment tests
│   │   │   ├── auth/            # Login/Register
│   │   │   ├── dashboard/       # Progress tracking dashboard
│   │   │   ├── learning/        # Lessons and practice
│   │   │   └── ...              # Existing components
│   │   ├── pages/               # Main pages
│   │   ├── services/            # API calls
│   │   ├── stores/              # Zustand state management
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Helper functions
│   ├── public/
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts          # Frontend build config
│   └── tsconfig.json           # Frontend TypeScript config
├── backend/                      # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/         # API Controllers (MVC)
│   │   ├── models/              # Database Models
│   │   ├── services/            # Business Logic
│   │   ├── routes/              # API Routes
│   │   ├── middleware/          # Authentication, Validation
│   │   └── utils/               # Helper functions
│   ├── config/                  # Configuration files
│   ├── package.json             # Backend dependencies
│   └── tsconfig.json           # Backend TypeScript config
├── package.json                 # Root package.json (monorepo)
├── .gitignore
└── README.md
```

## Key Features

### 1. Entrance Assessment System
- **Test Format**: 30 minutes, 40 questions covering Grammar, Vocabulary, Reading, and Listening.
- **Detailed Results**:
  - Overall score (0-100)
  - Proficiency classification (A1, A2, B1, B2, C1, C2)
  - Strength/Weakness report by skill
  - Personalized learning path recommendations

### 2. AI Chatbot Learning Assistant
- **Intelligent Interaction**: Answers questions regarding grammar and vocabulary.
- **Practical Examples**: Provides specific examples and practice exercises.
- **Mini Quiz**: Generates quick 5-question tests.
- **Progress Tracking**: Records interactions in the personal learning profile.

### 3. Adaptive Lesson System
- **Intelligent Logic**:
  - Based on entrance test results
  - Analyzes learning progress
  - AI recommends suitable lessons
  - Automatically adjusts difficulty
  - Prioritizes weak topics

### 4. Detailed Progress Tracking
- **Overview Dashboard**: Detailed learning statistics.
- **Progress Charts**: Tracks vocabulary, listening, tests, and streaks.
- **Achievements**: Achievement and badge system.
- **Weekly Activity**: Study time charts.

## Technology Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Zustand** (State management)
- **React Router** (Navigation)
- **Lucide React** (Icons)
- **Socket.IO Client** (Real-time chat)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **Socket.IO** (Real-time)
- **OpenAI API** (AI Chatbot)
- **JWT** (Authentication)
- **Bcrypt** (Password hashing)
- **Joi** (Validation)

### DevOps & Deployment
- **Vercel** (Frontend hosting)
- **MongoDB Atlas** (Database)
- **Git** (Version control)

## Installation and Execution

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### Quick Start (Recommended)

```bash
# Clone repository
git clone https://github.com/DoHungMinh/website-hoc-tieng-anh.git
cd website-hoc-tieng-anh

# Install dependencies for the entire monorepo
npm run install:all

# Create environment files
cp backend/.env.example backend/.env
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env.local

# Run both frontend and backend concurrently
npm run dev
```

### Manual Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Update .env with:
# - MONGODB_URI=mongodb://localhost:27017/english-learning
# - JWT_SECRET=your-secret-key
# - OPENAI_API_KEY=your-openai-key

# Run development server
npm run dev
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Run development server
npm run dev
```

### Available Scripts

#### Root Level (Monorepo)
```bash
npm run dev              # Run both frontend + backend
npm run build            # Build both projects
npm run test             # Test both projects
npm run lint             # Lint both projects
npm run install:all      # Install dependencies for all
npm run clean            # Clean node_modules and build files
```

#### Frontend Scripts
```bash
cd frontend
npm run dev              # Development server (Vite)
npm run build            # Production build
npm run preview          # Preview build
npm run lint             # ESLint check
```

#### Backend Scripts
```bash
cd backend
npm run dev              # Development server (nodemon)
npm run build            # TypeScript build
npm run start            # Production server
npm run test             # Jest tests
npm run lint             # ESLint check
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout

### Assessment
- `POST /api/assessment/create` - Create test
- `POST /api/assessment/start/:id` - Start test
- `POST /api/assessment/submit-answer` - Submit answer
- `POST /api/assessment/complete/:id` - Complete test

### Progress
- `GET /api/progress` - Get progress
- `PUT /api/progress/update` - Update progress

### Chatbot
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/history` - Chat history

## UI/UX Design

### Design System
- **Colors**: Green gradient (green-800 → lime-600)
- **Typography**: Font weights from medium to bold
- **Spacing**: Consistent padding and margins
- **Border Radius**: 2xl (16px) for cards, xl (12px) for buttons
- **Shadows**: Subtle box-shadows for depth

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## Documentation

Comprehensive project documentation is organized in the [`docs/`](docs/) folder:

- **[Setup & Configuration](docs/01-setup/)** - Initial setup, tech stack, admin accounts
- **[Features](docs/02-features/)** - AI chatbot, IELTS generation, payment system
- **[Bug Fixes](docs/03-fixes/)** - Issue resolutions and improvements
- **[Guides](docs/04-guides/)** - How-to guides and workflows
- **[Analysis](docs/05-analysis/)** - Technical analysis and planning
- **[Summaries](docs/06-summaries/)** - Project changelogs and reports

See [docs/README.md](docs/README.md) for the complete documentation index.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Vercel Deployment

```bash
# Build frontend
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend Deployment
- Deploy to services like Railway, Render, or Heroku
- Update CORS origins and environment variables

## License

MIT License

## Contributors

- **DoHungMinh** - Initial work and development

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you have questions or need support:
- Create an issue on GitHub
- Email: support@engpro.com

---

**Happy Learning!**
