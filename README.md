# 🎓 English Learning Platform with AI Chatbot

Một nền tảng học tiếng Anh trực tuyến hoàn chỉnh với AI Chatbot thông minh, hệ thống đánh giá trình độ và bài học thích ứng.

## ✅ Trạng thái dự án

- **Frontend**: ✅ Hoàn thành - React + TypeScript + Vite + Tailwind CSS
- **Backend Structure**: ✅ Hoàn thành - Node.js + Express + MongoDB (MVC)
- **Components**: ✅ Hoàn thành - UI/UX components và features
- **Development Environment**: ✅ Sẵn sàng - Dev server chạy tại http://localhost:5173
- **Package Management**: ✅ Hoàn thành - NPM workspaces cho monorepo

## 🏗️ Kiến trúc dự án

```
website-hoc-tieng-anh/
├── frontend/                     # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── assessment/       # Bài test đánh giá trình độ
│   │   │   ├── auth/            # Đăng nhập/Đăng ký
│   │   │   ├── dashboard/       # Dashboard theo dõi tiến độ
│   │   │   ├── learning/        # Bài học và luyện tập
│   │   │   └── ...              # Components hiện có
│   │   ├── pages/               # Trang chính
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
│   │   └── utils/               # Helper functions
│   ├── config/                  # Configuration files
│   └── package.json
├── .gitignore
└── README.md
```

## ✨ Tính năng chính

### 🔍 1. Hệ thống đánh giá đầu vào
- **Bài test 30 phút, 40 câu hỏi**:
  - 10 câu ngữ pháp cơ bản
  - 10 câu từ vựng
  - 10 câu đọc hiểu
  - 10 câu nghe hiểu
- **Kết quả chi tiết**:
  - Điểm số tổng thể (0-100)
  - Phân loại trình độ (A1, A2, B1, B2, C1, C2)
  - Báo cáo điểm mạnh/yếu từng kỹ năng
  - Đề xuất lộ trình học phù hợp

### 🤖 2. AI Chatbot hỗ trợ học tập
- **Tương tác thông minh**: Trả lời câu hỏi về ngữ pháp, từ vựng
- **Ví dụ thực tế**: Cung cấp ví dụ cụ thể và bài tập thực hành
- **Quiz mini**: Tạo bài kiểm tra nhanh 5 câu
- **Ghi nhận tiến độ**: Lưu vào hồ sơ học tập cá nhân

### 📚 3. Hệ thống bài học thích ứng
- **Logic thông minh**:
  - Dựa trên kết quả test đầu vào
  - Phân tích tiến độ học tập
  - AI đề xuất bài học phù hợp
  - Điều chỉnh độ khó tự động
  - Ưu tiên các chủ đề còn yếu

### 📊 4. Theo dõi tiến độ chi tiết
- **Dashboard tổng quan**: Thống kê học tập chi tiết
- **Biểu đồ tiến độ**: Theo dõi từ vựng, nghe, kiểm tra, streak
- **Thành tích**: Hệ thống achievement và badges
- **Hoạt động hàng tuần**: Biểu đồ thời gian học

## 🛠️ Công nghệ sử dụng

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

## 🚀 Cài đặt và chạy dự án

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### Quick Start (Recommended)

```bash
# Clone repository
git clone https://github.com/DoHungMinh/website-hoc-tieng-anh.git
cd website-hoc-tieng-anh

# Cài đặt dependencies cho toàn bộ monorepo
npm run install:all

# Tạo environment files
cp backend/.env.example backend/.env
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env.local

# Chạy cả frontend và backend cùng lúc
npm run dev
```

### Manual Setup

#### Backend Setup

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Cấu hình environment variables
cp .env.example .env
# Cập nhật thông tin trong .env:
# - MONGODB_URI=mongodb://localhost:27017/english-learning
# - JWT_SECRET=your-secret-key
# - OPENAI_API_KEY=your-openai-key

# Chạy development server
npm run dev
```

#### Frontend Setup

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Chạy development server
npm run dev
```

### Available Scripts

#### Root Level (Monorepo)
```bash
npm run dev              # Chạy cả frontend + backend
npm run build            # Build cả hai projects
npm run test             # Test cả hai projects
npm run lint             # Lint cả hai projects
npm run install:all      # Cài đặt dependencies cho tất cả
npm run clean            # Xóa node_modules và build files
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

### Database Setup

```bash
# Khởi động MongoDB local
mongod

# Hoặc sử dụng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI trong .env
```

## 📁 Cấu trúc Database

### User Schema
```javascript
{
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  level: Enum['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  preferences: Object,
  streakCount: Number,
  totalStudyHours: Number
}
```

### Assessment Schema
```javascript
{
  userId: ObjectId,
  type: Enum['placement', 'progress', 'final'],
  questions: [Question],
  userAnswers: [UserAnswer],
  results: AssessmentResult,
  timeLimit: Number
}
```

### Progress Schema
```javascript
{
  userId: ObjectId,
  vocabulary: { learned, target, recentWords },
  listening: { hoursCompleted, target },
  testsCompleted: { completed, target },
  studyStreak: { current, target },
  weeklyActivity: [WeeklyData],
  achievements: [Achievement]
}
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

### Assessment
- `POST /api/assessment/create` - Tạo bài test
- `POST /api/assessment/start/:id` - Bắt đầu làm bài
- `POST /api/assessment/submit-answer` - Nộp câu trả lời
- `POST /api/assessment/complete/:id` - Hoàn thành bài test

### Progress
- `GET /api/progress` - Lấy tiến độ
- `PUT /api/progress/update` - Cập nhật tiến độ

### Chatbot
- `POST /api/chatbot/message` - Gửi tin nhắn
- `GET /api/chatbot/history` - Lịch sử chat

## 🎨 UI/UX Design

### Design System
- **Colors**: Green gradient (green-800 → lime-600)
- **Typography**: Font weights từ medium đến bold
- **Spacing**: Consistent padding và margins
- **Border Radius**: 2xl (16px) cho cards, xl (12px) cho buttons
- **Shadows**: Subtle box-shadows cho depth

### Components Style
- **Cards**: White background, gradient borders, hover animations
- **Buttons**: Gradient backgrounds, hover effects, transform scales
- **Progress Bars**: Gradient fills, smooth transitions
- **Forms**: Clean inputs, focus states, validation styling

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 📦 Deployment

### Vercel Deployment

```bash
# Build frontend
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend Deployment
- Deploy to services như Railway, Render, hoặc Heroku
- Cập nhật CORS origins và environment variables

## 📄 License

MIT License

## 👥 Contributors

- **DoHungMinh** - Initial work và development

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📞 Support

Nếu bạn có câu hỏi hoặc cần hỗ trợ:
- Tạo issue trên GitHub
- Email: support@englishpro.vn

---

**Happy Learning! 🎓✨**
