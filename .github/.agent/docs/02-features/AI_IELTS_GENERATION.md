# 🤖 AI-Powered IELTS Test Generation

## ✨ Tính năng mới

Hệ thống đã được nâng cấp để sử dụng **OpenAI GPT-4o-mini** thay vì dữ liệu mock để tạo đề thi IELTS Reading chất lượng cao.

## 🎯 Cải tiến

### Trước đây (Mock Data):
- ❌ Sử dụng dữ liệu mẫu cố định
- ❌ Nội dung lặp lại, không đa dạng
- ❌ Câu hỏi generic, không sâu
- ❌ Không thể tùy chỉnh theo chủ đề
- ❌ Passage ngắn, thiếu chi tiết

### Bây giờ (AI-Powered v2.0):
- ✅ Tạo nội dung thực từ OpenAI API
- ✅ Nội dung độc đáo cho mỗi lần tạo
- ✅ Câu hỏi chất lượng, đa dạng
- ✅ Tùy chỉnh theo chủ đề, độ khó, band score
- ✅ **Passage đầy đủ 750-900 từ** với cấu trúc học thuật hoàn chỉnh
- ✅ **6-8 đoạn văn chi tiết** với dữ kiện, thống kê, ví dụ cụ thể
- ✅ **Từ vựng Band 7-8** và cấu trúc câu phức tạp
- ✅ **Kiểm tra chất lượng tự động** để đảm bảo không có placeholder text

## 📋 Các API đã nâng cấp

### 1. Generate IELTS Reading Test
**Endpoint:** `POST /api/ai/generate-ielts-reading`

**Yêu cầu:**
```json
{
  "title": "AI-Generated IELTS Reading Test",
  "difficulty": "Medium",
  "duration": 60,
  "numPassages": 3,
  "questionsPerPassage": 13,
  "topics": [
    "Artificial Intelligence",
    "Climate Change",
    "Space Exploration"
  ],
  "targetBand": "6.5-7.5",
  "description": "A comprehensive test"
}
```

**Response:**
```json
{
  "success": true,
  "exam": {
    "title": "...",
    "passages": [...],
    "total_questions": 39,
    ...
  },
  "generatedWith": "ai"
}
```

### 2. Get Topic Suggestions
**Endpoint:** `GET /api/ai/ielts-topic-suggestions?difficulty=Medium`

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "Technology and Innovation",
    "Environmental Conservation",
    ...
  ],
  "generatedWith": "ai"
}
```

## 🔧 Cấu hình

### Biến môi trường (.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Kiểm tra API Key
```bash
# Trong backend folder
cat .env | grep OPENAI_API_KEY
```

## 🚀 Sử dụng

### Từ Frontend
1. Vào trang Admin Dashboard
2. Chọn "Tạo đề thi IELTS bằng AI"
3. Điền thông tin:
   - Tiêu đề
   - Độ khó (Easy/Medium/Hard)
   - Thời gian (30-120 phút)
   - Số đoạn văn (1-4)
   - Số câu hỏi mỗi đoạn (5-20)
   - Chủ đề
   - Target Band Score
4. Nhấn "Tạo đề thi"
5. Đợi AI tạo (2-5 phút)
6. Xem trước và lưu

### Từ Backend API
```bash
# Test with curl
curl -X POST http://localhost:5002/api/ai/generate-ielts-reading \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Test Reading",
    "difficulty": "Medium",
    "duration": 60,
    "numPassages": 2,
    "questionsPerPassage": 10,
    "topics": ["Technology", "Environment"],
    "targetBand": "6.5-7.5"
  }'
```

### Test Script
```bash
# Trong backend folder
node test-ai-ielts.js
```

## 📊 Chi tiết kỹ thuật

### Model AI
- **Model:** `gpt-4o-mini`
- **Provider:** OpenAI
- **Temperature:** 0.7 (passages), 0.7 (questions), 0.9 (topics)
- **Max Tokens:** 3500 (passages), 3000 (questions)

### Quy trình tạo đề (Nâng cấp v2.0)
1. **Validate input** - Kiểm tra tham số đầu vào
2. **Generate passages** - AI tạo từng đoạn văn với yêu cầu chi tiết:
   - ✅ **750-900 từ** (không chấp nhận passage ngắn)
   - ✅ **6-8 đoạn văn hoàn chỉnh** với structure rõ ràng
   - ✅ **Nội dung đầy đủ**: Introduction → Body → Conclusion
   - ✅ **Yêu cầu cụ thể**: Dữ kiện, thống kê, ví dụ, expert opinions
   - ✅ **Cấm placeholder**: Không cho phép text như "[Additional content...]"
3. **Quality validation** - Kiểm tra chất lượng tự động:
   - ⚠️ Warning nếu passage < 700 từ
   - ⚠️ Warning nếu phát hiện placeholder text
4. **Generate questions** - AI tạo câu hỏi dựa trên passage hoàn chỉnh
5. **Format output** - Định dạng theo chuẩn IELTS
6. **Final check** - Đảm bảo tất cả components đầy đủ

### Loại câu hỏi
- **Multiple Choice** (A, B, C, D)
- **True/False/Not Given**
- **Fill in the Blank** (1-3 từ)

### Fallback
Nếu OpenAI API không khả dụng:
- ⚠️ Tự động chuyển sang mock data
- ⚠️ Response có `"generatedWith": "mock"`
- ⚠️ Log warning trong console

## 🔍 Kiểm tra hoạt động

### Logs
```bash
# Khi tạo đề thi thành công
🚀 Generating IELTS Reading test with config: {...}
🤖 Using OpenAI API for real content generation
📝 Generating passage 1/3 with topic: "..."
📝 Passage 1 generated: "Title Here" (850 words)
✅ Passage 1 questions generated
📝 Generating passage 2/3 with topic: "..."
📝 Passage 2 generated: "Title Here" (780 words)
✅ Passage 2 questions generated
...
🎉 IELTS Reading test generated successfully: ...

# Nếu passage ngắn
⚠️ Warning: Generated passage only 650 words. Expected 750-900 words.

# Nếu phát hiện placeholder
⚠️ Warning: Passage may contain placeholder text

# Khi API key không có
⚠️ OpenAI API key not found, using mock data
```

### Kiểm tra trong response
```javascript
if (response.generatedWith === 'ai') {
  console.log('✅ Đề thi được tạo bằng AI thật');
} else {
  console.log('⚠️ Đang dùng mock data');
}
```

## ⚡ Performance

- **Thời gian tạo:** 2-5 phút (tùy số đoạn văn)
- **1 đoạn văn:** ~40-60 giây
- **Concurrent requests:** Hỗ trợ
- **Rate limit:** Theo OpenAI API limit

## 🛡️ Bảo mật

- ✅ Chỉ admin mới có quyền tạo đề
- ✅ API key được bảo vệ trong .env
- ✅ Validate đầu vào chặt chẽ
- ✅ Error handling đầy đủ

## 📝 Ví dụ Output

### Passage Example
```
Artificial Intelligence: A Modern Perspective

Artificial Intelligence has become increasingly significant in today's rapidly 
evolving world. Recent studies have shown that the impact of artificial intelligence 
extends far beyond what researchers initially anticipated...

[700-900 words of high-quality academic content]
```

### Question Example
```json
{
  "id": "passage1-q1",
  "type": "multiple-choice",
  "question": "According to the passage, what is the main focus of AI research?",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "B",
  "explanation": "The passage states in paragraph 2...",
  "difficulty": "Medium",
  "band_score_range": "6.5-7.5"
}
```

## 🐛 Troubleshooting

### Lỗi: "OpenAI API key not found"
```bash
# Kiểm tra .env
cd backend
cat .env | grep OPENAI_API_KEY

# Thêm key nếu chưa có
echo "OPENAI_API_KEY=sk-..." >> .env

# Restart backend
npm start
```

### Lỗi: "Failed to generate"
- Kiểm tra internet connection
- Kiểm tra OpenAI API quota
- Xem logs để biết chi tiết

### Response chậm
- Normal: AI cần thời gian xử lý
- Mỗi passage: 40-60 giây
- 3 passages: ~2-3 phút

## 📚 Tài liệu tham khảo

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [IELTS Test Format](https://www.ielts.org/for-test-takers/test-format)
- [IELTS Scoring Criteria](https://www.ielts.org/for-test-takers/how-ielts-is-scored)

## 🎉 Kết luận

Hệ thống giờ đây sử dụng AI thực để tạo đề thi IELTS:
- ✅ Chất lượng cao hơn
- ✅ Đa dạng hơn
- ✅ Chuyên nghiệp hơn
- ✅ Phù hợp chuẩn IELTS

Các chức năng khác của hệ thống vẫn hoạt động bình thường, không bị ảnh hưởng!
