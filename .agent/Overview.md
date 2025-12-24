## MÔ TẢ BÀI TOÁN ENGPRO

### **Bài toán**

Người học tiếng Anh thường gặp khó khăn trong việc xác định chính xác trình độ hiện tại, tìm kiếm lộ trình học tập phù hợp và thiếu môi trường tương tác để giải đáp thắc mắc tức thì. Đặc biệt, việc chuẩn bị cho kỳ thi IELTS đòi hỏi tài liệu chất lượng và phương pháp luyện tập hiệu quả. Các khóa học trực tuyến truyền thống thường thiết kế theo kiểu "one-size-fits-all", thiếu sự cá nhân hóa dựa trên điểm mạnh, điểm yếu và mục tiêu riêng của từng người học.

### **Giải pháp**

**ENGPRO** là nền tảng học tiếng Anh trực tuyến toàn diện tích hợp:
- **AI Chatbot thông minh (GoPro 4.2)**: Hỗ trợ text và voice chat 24/7
- **Hệ thống luyện thi IELTS đầy đủ**: Reading, Listening, Writing, Speaking
- **Đánh giá năng lực đầu vào**: Xếp loại trình độ A1-C2
- **Lộ trình học tập thích ứng (Adaptive Learning)**: Tự động điều chỉnh theo tiến độ người học
- **Trang quản trị Admin**: Quản lý khóa học, tạo đề thi IELTS bằng AI

## CÔNG NGHỆ SỬ DỤNG

### **Nền tảng chính**

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend Client** | React 18 + TypeScript + Vite |
| **Frontend Admin** | React 18 + TypeScript + Vite |
| **Backend** | Node.js + Express.js + TypeScript |
| **Database** | MongoDB + Mongoose |
| **AI Engine** | OpenAI API (GPT-4, Whisper, TTS) |
| **State Management** | Zustand |
| **Styling** | CSS Modules + Tailwind CSS |
| **Authentication** | JWT + Bcrypt |
| **Real-time** | Socket.IO |
| **Payment** | VNPay |

### **Kiến trúc AI**

Hệ thống tích hợp OpenAI API để xây dựng:
1. **Chatbot GoPro 4.2**: Hiểu ngữ cảnh, giải thích ngữ pháp, cung cấp ví dụ, hỗ trợ voice chat
2. **IELTS AI Generator**: Tạo đề thi IELTS tự động (Reading passages, Questions, Writing prompts)
3. **Learning Analytics**: Phân tích tiến độ và đưa ra gợi ý cá nhân hóa

## CẤU TRÚC DỮ LIỆU

### **Collection users**
Lưu thông tin học viên: email, mật khẩu đã mã hóa, thông tin cá nhân.
- `level` (A1-C2): Trình độ hiện tại
- `streak`: Chuỗi ngày học liên tục
- `preferences`: Mục tiêu học tập
- `role`: user/admin

### **Collection courses/lessons**
Kho nội dung bài học "Knowledge Base":
- Phân loại theo trình độ (A1-C2) và kỹ năng
- Lý thuyết, ví dụ và bài tập thực hành
- Video lessons với YouTube integration

### **Collection ieltsExams**
Lưu trữ đề thi IELTS:
- Reading passages với các loại câu hỏi (Multiple Choice, True/False/Not Given, Matching, Fill in blanks)
- Listening audio và transcripts
- Writing tasks (Task 1, Task 2)
- Speaking topics

### **Collection progress**
Theo dõi tiến độ học tập chi tiết:
- Bài học đã hoàn thành, điểm số
- Kết quả thi IELTS
- Vocabulary đã học
- Dữ liệu cho Dashboard và thuật toán gợi ý

### **Collection chatSessions**
Lịch sử chat với AI:
- Messages (user/assistant)
- Context và metadata
- Session management

## LUỒNG HOẠT ĐỘNG

### **1. Đánh giá & Xếp lớp (Assessment)**
1. Người dùng mới thực hiện bài Test đầu vào (30 phút)
2. Hệ thống chấm điểm, phân tích kỹ năng và xếp loại trình độ (A1-C2)
3. Đề xuất lộ trình học tập phù hợp

### **2. Học tập thích ứng (Adaptive Learning)**
1. Người dùng bắt đầu học theo lộ trình gợi ý
2. Hệ thống theo dõi kết quả bài tập và tương tác
3. Tự động điều chỉnh độ khó và đề xuất bài tập bổ trợ

### **3. Luyện thi IELTS**
1. Chọn kỹ năng cần luyện (Reading/Listening/Writing/Speaking)
2. Làm bài thi mô phỏng với thời gian chuẩn
3. Nhận kết quả chi tiết và phân tích điểm yếu

### **4. AI Chatbot Support (GoPro 4.2)**
1. Người dùng đặt câu hỏi qua text hoặc voice
2. GoPro 4.2 sử dụng OpenAI API để trả lời kèm ví dụ minh họa
3. Hỗ trợ phân tích tiến độ và đưa ra gợi ý cá nhân

### **5. Admin Management**
1. Quản lý khóa học và lessons
2. Tạo đề thi IELTS bằng AI hoặc thủ công
3. Xem thống kê người dùng và hệ thống

## ĐIỂM NỔI BẬT

| Tính năng | Mô tả |
|-----------|-------|
| **Quy trình khép kín** | Kiểm tra → Lộ trình cá nhân → Học tập → Theo dõi → Đánh giá lại |
| **Cá nhân hóa sâu** | Nội dung thay đổi linh hoạt theo level và progress |
| **AI Tutor GoPro 4.2** | Hỗ trợ 24/7 với text và voice chat |
| **IELTS Preparation** | Hệ thống luyện thi đầy đủ 4 kỹ năng |
| **AI Exam Generator** | Tạo đề thi IELTS tự động bằng AI |
| **Voice Chat** | Luyện Speaking với AI qua Whisper + TTS |
| **Gamification** | Streak, Badges, Thống kê trực quan |
| **Admin Dashboard** | Quản lý toàn diện qua giao diện riêng |

---
*EngPro Overview - Updated December 2025*
