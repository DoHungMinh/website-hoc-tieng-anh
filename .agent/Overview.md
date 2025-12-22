## 📋 MÔ TẢ BÀI TOÁN UNILISH

### **Bài toán**

Người học tiếng Anh thường gặp khó khăn trong việc xác định chính xác trình độ hiện tại, tìm kiếm lộ trình học tập phù hợp và thiếu môi trường tương tác để giải đáp thắc mắc tức thì. Các khóa học trực tuyến truyền thống thường thiết kế theo kiểu "one-size-fits-all", thiếu sự cá nhân hóa dựa trên điểm mạnh, điểm yếu và mục tiêu riêng của từng người học.

### **Giải pháp**

UNILISH là nền tảng học tiếng Anh trực tuyến toàn diện tích hợp AI Chatbot thông minh, cung cấp hệ thống đánh giá năng lực đầu vào chuẩn xác và lộ trình học tập thích ứng (Adaptive Learning). Hệ thống tự động phân tích và điều chỉnh nội dung học tập dựa trên tiến độ, kết quả kiểm tra và sở thích của người dùng.

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### **Nền tảng chính**

- **Data Management**: strictly separated into **React Query** (Server State/Caching) and **Zustand** (Client State/Session) for maximum performance.
- **AI Engine**: OpenAI API (Hỗ trợ Chatbot và phân tích lộ trình)
- **Database**: MongoDB (Lưu trữ dữ liệu)
- **Styling**: Vanilla CSS (Module CSS preference)
- **Bảo mật**: JWT Authentication, Bcrypt

### **Kiến trúc AI**

Hệ thống tích hợp OpenAI API để xây dựng Chatbot thông minh có khả năng hiểu ngữ cảnh, giải thích ngữ pháp, cung cấp ví dụ và tạo bài tập nhanh, đóng vai trò như một gia sư ảo 24/7.

## 📊 CẤU TRÚC DỮ LIỆU

### **Collection users**

Lưu thông tin học viên bao gồm email, mật khẩu đã mã hóa, và thông tin cá nhân.
- **Quan trọng**: `level` (A1-C2), `streak` (chuỗi ngày học liên tục), và `preferences` (mục tiêu học tập) để hệ thống cá nhân hóa gợi ý bài học.

### **Collection assessments**

Lưu trữ các bài kiểm tra (Placement Test, Progress Test).
- Cấu trúc bao gồm các câu hỏi đa dạng (Trắc nghiệm, Điền từ, Nghe/Đọc).
- Kết quả chi tiết giúp phân loại trình độ người dùng chính xác.

### **Collection courses/lessons**

Kho nội dung bài học "Knowledge Base" của hệ thống.
- Được phân loại kỹ lưỡng theo trình độ (A1-C2) và kỹ năng (Từ vựng, Ngữ pháp).
- Mỗi bài học chứa lý thuyết, ví dụ và bài tập thực hành.

### **Collection progress**

Lưu vết tiến độ học tập chi tiết của người dùng.
- Theo dõi các bài học đã hoàn thành, điểm số, từ vựng đã học.
- Dữ liệu này được sử dụng để hiển thị Dashboard và làm đầu vào cho thuật toán gợi ý bài học tiếp theo.

## 🔄 LUỒNG HOẠT ĐỘNG

### **Đánh giá & Xếp lớp (Assessment)**

1. Người dùng mới thực hiện bài Test đầu vào (30 phút).
2. Hệ thống chấm điểm, phân tích kỹ năng và xếp loại trình độ (A1-C2).
3. Đề xuất lộ trình học tập phù hợp nhất.

### **Học tập thích ứng (Adaptive Learning)**

1. Người dùng bắt đầu học theo lộ trình gợi ý.
2. Hệ thống theo dõi kết quả bài tập và tương tác.
3. Nếu người dùng yếu kỹ năng nào, hệ thống tự động đề xuất thêm bài tập bổ trợ cho kỹ năng đó.

### **AI Chatbot Support**

1. Người dùng đặt câu hỏi (ví dụ: "Giải thích thì hiện tại hoàn thành").
2. Chatbot sử dụng OpenAI API để trả lời kèm ví dụ minh họa dễ hiểu.
3. Có thể yêu cầu Chatbot tạo quiz nhanh để kiểm tra kiến thức vừa hỏi.

## ✨ ĐIỂM NỔI BẬT

**Quy trình khép kín**: Từ Kiểm tra đầu vào -> Lộ trình cá nhân -> Học tập & Luyện tập -> Theo dõi tiến độ -> Đánh giá lại.

**Cá nhân hóa sâu**: Nội dung học tập không cố định mà thay đổi linh hoạt dựa trên `level` và `progress` thực tế của người dùng.

**AI Tutor thông minh**: Hỗ trợ giải đáp thắc mắc mọi lúc mọi nơi, giúp người học không bị tắc nghẽn kiến thức.

**Gamification**: Hệ thống Streak, Badges và Thống kê trực quan giúp duy trì động lực học tập mỗi ngày.
