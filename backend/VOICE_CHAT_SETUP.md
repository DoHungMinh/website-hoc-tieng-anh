# 🎙️ Voice Chat with Cloudinary Integration - Setup Guide

## ✅ Đã hoàn thành

### 1. Fix lỗi folder uploads/audio
- ✅ Tự động tạo folder `uploads/audio/` nếu chưa tồn tại
- ✅ File: `backend/src/routes/voiceChat.routes.ts`

### 2. Cloudinary Integration
- ✅ Config: `backend/src/config/cloudinary.ts`
- ✅ Service: `backend/src/services/cloudinaryService.ts`
- ✅ Tích hợp vào: `backend/src/services/voiceChatService.ts`
- ✅ Model updated: `backend/src/models/VoiceChatSession.ts`
- ✅ Controller updated: `backend/src/controllers/voiceChatController.ts`

## 🔧 Cấu hình Cloudinary

### Bạn đã có sẵn trong `.env`:
```env
CLOUDINARY_CLOUD_NAME=dcmusfn05
CLOUDINARY_API_KEY=372176727744111
CLOUDINARY_API_SECRET=7XzYD_PJhT_s3hfo1TS0Rx9kVng
```

### Nếu cần tạo mới:
1. Truy cập: https://cloudinary.com/
2. Sign up / Login
3. Vào Dashboard → Settings → Product Environment Credentials
4. Copy: Cloud Name, API Key, API Secret
5. Paste vào file `.env`

## 🔄 Luồng hoạt động hiện tại

```
1. User record audio (Frontend)
   ↓
2. Upload to Backend → Save temp to uploads/audio/
   ↓
3. STT: Whisper transcribe
   ↓
4. AI: GPT generate response
   ↓
5. TTS: Create audio response → temp file
   ↓
6. PARALLEL: Upload user's audio → Cloudinary ☁️
   ↓
7. Convert response audio → base64
   ↓
8. Return to Frontend:
   - transcript
   - AI response text
   - audio base64 (để play)
   - userAudioUrl (Cloudinary URL - để replay sau)
   ↓
9. Cleanup temp files
```

## 📋 Response Structure

```json
{
  "success": true,
  "transcript": "Hello, my name is John",
  "response": "Nice to meet you John! What do you like to do?",
  "audioData": "base64_encoded_audio_string",
  "userAudioUrl": "https://res.cloudinary.com/.../user-audio-123.mp3",
  "sessionId": "voice-1234567890",
  "processingTime": 2500,
  "estimatedCost": 0.001
}
```

## 🎯 Các tính năng đã có

### 1. Auto-create upload folder
- Tự động tạo `uploads/audio/` khi khởi động

### 2. Cloudinary Upload
- Upload audio của user lên cloud
- Non-blocking (async, không làm chậm response)
- Graceful failure (nếu Cloudinary fail, vẫn trả về response)

### 3. URL Persistence
- Lưu Cloudinary URL để replay sau
- User có thể nghe lại conversation

### 4. Cleanup
- Local temp files: Tự động xóa sau khi xử lý
- Cloudinary: Có method `cleanupOldFiles()` để xóa files cũ

## 🧪 Test Voice Chat

### Test từ Frontend:
1. Mở: http://localhost:3000/chat (hoặc URL của bạn)
2. Click mic button → Allow permission
3. Nói: "Hello, how are you?"
4. Đợi AI response
5. Check console để xem:
   - ✅ Transcript
   - ✅ AI response
   - ✅ Audio playing
   - ✅ Cloudinary URL (nếu có)

### Test từ Backend logs:
```
🎙️ Voice chat request from user: 123
📁 Audio file: uploads/audio/audio-1234.webm
🔊 Voice preference: nova
🎤 Starting audio transcription
✅ Transcript: "Hello how are you"
🤖 Generating AI response...
✅ AI Response: "I'm doing great! How about you?"
🔊 Converting to speech...
☁️ Uploading user audio to Cloudinary...
✅ User audio uploaded to Cloudinary: https://res.cloudinary.com/...
✅ Voice chat completed in 2500ms
```

## 📊 Cloudinary Dashboard

Xem files đã upload:
1. Login: https://cloudinary.com/console
2. Media Library → Folders → voice-chat
3. Xem statistics: Usage, Transformations, Bandwidth

## ⚙️ Tùy chỉnh

### Upload folder structure:
```typescript
// Trong cloudinaryService.ts
const folder = options?.folder || 'voice-chat';
// Tạo subfolder per user:
folder: `${folder}/${userId}`
// Result: voice-chat/user-123/audio-456.mp3
```

### Auto cleanup:
```typescript
// Chạy cleanup mỗi ngày (có thể setup cron job)
cloudinaryService.cleanupOldFiles('voice-chat', 30); // Xóa files > 30 ngày
```

## 🚀 Next Steps (Tương lai)

### Phase 2: Azure Speech Assessment
- [ ] Integrate Azure Speech SDK
- [ ] Pronunciation scoring
- [ ] Fluency analysis
- [ ] Save assessment results

### Phase 3: OpenAI Realtime API
- [ ] WebSocket connection
- [ ] Streaming audio
- [ ] Lower latency

### Phase 4: Advanced Features
- [ ] Conversation history
- [ ] Progress tracking
- [ ] Replay with word-level highlights
- [ ] Share results

## ❗ Troubleshooting

### Lỗi: "Cloudinary not configured"
```bash
# Check .env file có 3 variables:
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Restart backend sau khi thay đổi .env
```

### Lỗi: "ENOENT: no such file or directory"
```bash
# Folder uploads/audio/ sẽ tự động tạo
# Nếu vẫn lỗi, tạo thủ công:
mkdir -p backend/uploads/audio
```

### Lỗi: "Audio upload to Cloudinary failed"
```bash
# Không ảnh hưởng chức năng chính
# Check:
# 1. Internet connection
# 2. Cloudinary credentials
# 3. File size (max 100MB free tier)
```

## 📝 Notes

- ✅ Voice chat hoạt động KHÔNG CẦN Cloudinary
- ✅ Cloudinary là optional enhancement
- ✅ Nếu Cloudinary fail → conversation vẫn tiếp tục
- ✅ Local temp files always cleanup
- ✅ Free tier: 10GB storage, đủ cho development

## 🎉 Status: READY TO TEST!

Backend đã chạy thành công với:
- ✅ Cloudinary configured
- ✅ Voice chat endpoints
- ✅ Folder auto-creation
- ✅ Audio upload integration

Giờ có thể test voice chat từ frontend!
