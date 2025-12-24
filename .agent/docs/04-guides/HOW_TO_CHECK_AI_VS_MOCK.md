# 🔍 HƯỚNG DẪN KIỂM TRA DỮ LIỆU AI vs MOCK DATA

## Cách kiểm tra nhanh khi tạo khóa học

### ✅ **ĐỂ BIẾT DỮ LIỆU LÀ AI HAY MOCK, HÃY XEM:**

### 1. **Xem Log Backend Console**

Khi bạn tạo khóa học từ 15-30 câu, hãy xem terminal backend sẽ hiện:

#### **TH1: Dữ liệu từ OpenAI API (THẬT)** ✅
```
🤖 AI Course Generator - Starting generation with config: {...}
📊 Requested: 30 vocabulary items
🔢 Generating 30 vocabulary items, estimated tokens: 8000
✅ AI generated 30/30 vocabulary items          <-- DỮ LIỆU AI THẬT
✅ Successfully generated course with 30 items
```

**Dấu hiệu nhận biết:**
- ✅ Có log `🔢 Generating...`
- ✅ Có log `✅ AI generated X/Y items`
- ✅ Không có log `⚠️ OpenAI API key not found`
- ✅ Không có log `🔄 Falling back to mock data`
- ✅ Không có log `🎭 Generating mock course data`

#### **TH2: Dữ liệu Mock (GIẢ)** ❌
```
🤖 AI Course Generator - Starting generation with config: {...}
📊 Requested: 30 vocabulary items
⚠️ OpenAI API key not found, using fallback mock data  <-- API KEY THIẾU
🔄 Falling back to mock data generation                 <-- FALLBACK
🎭 Generating mock course data for: vocabulary Marketing <-- MOCK DATA
✅ Successfully generated course with 30 items
```

**Dấu hiệu nhận biết:**
- ❌ Có log `⚠️ OpenAI API key not found`
- ❌ Có log `🔄 Falling back to mock data`
- ❌ Có log `🎭 Generating mock course data`
- ❌ Không có log `🔢 Generating...`

#### **TH3: Lỗi Parse JSON (đã fix rồi)** ⚠️
```
🤖 AI Course Generator - Starting generation with config: {...}
📊 Requested: 30 vocabulary items
🔢 Generating 30 vocabulary items, estimated tokens: 8000
Failed to parse AI response: SyntaxError...              <-- LỖI PARSE
❌ Error generating course with AI: Error: Invalid AI response format
🔄 Falling back to mock data generation                  <-- FALLBACK
🎭 Generating mock course data for: vocabulary Marketing <-- MOCK DATA
```

### 2. **Xem Nội Dung Từ Vựng**

#### **Dữ liệu Mock** (GIẢ):
```
Word: marketing-word-1
Word: marketing-word-2
Word: marketing-word-3
...
Word: technology-word-15

Meaning: Nghĩa của từ về Marketing số 1
Example: This is an example sentence using Marketing word 1.
```

**Dấu hiệu:**
- ❌ Từ có format: `topic-word-1`, `topic-word-2`
- ❌ Nghĩa: "Nghĩa của từ về [topic] số X"
- ❌ Example: "This is an example sentence using [topic] word X"

#### **Dữ liệu AI Thật** (OpenAI):
```
Word: segmentation
Pronunciation: /ˌseɡmenˈteɪʃn/
Meaning: Phân khúc thị trường, quá trình chia nhỏ thị trường thành các nhóm khách hàng có đặc điểm tương đồng
Example: Market segmentation allows companies to target specific customer demographics with tailored marketing strategies.

Word: branding
Pronunciation: /ˈbrændɪŋ/
Meaning: Xây dựng thương hiệu, quá trình tạo ra nhận diện và hình ảnh độc đáo cho sản phẩm hoặc dịch vụ
Example: Effective branding helps differentiate your product from competitors in a crowded marketplace.

Word: ROI (Return on Investment)
Pronunciation: /ɑːr oʊ aɪ/
Meaning: Lợi nhuận đầu tư, chỉ số đo lường hiệu quả tài chính của một khoản đầu tư
Example: The marketing campaign delivered an impressive ROI of 300%, tripling the initial investment.
```

**Dấu hiệu:**
- ✅ Từ là từ tiếng Anh thật: `segmentation`, `branding`, `ROI`
- ✅ Pronunciation chuẩn IPA: `/ˌseɡmenˈteɪʃn/`
- ✅ Nghĩa chi tiết, chuyên môn, đầy đủ
- ✅ Example thực tế, có ngữ cảnh, câu phức

### 3. **Test Ngay Bây Giờ**

**Bước 1:** Mở Terminal Backend (đang chạy)
**Bước 2:** Vào Admin Panel → Tạo khóa học AI
**Bước 3:** Chọn:
- Type: Vocabulary
- Topic: Marketing
- Level: B1
- Content Length: **15 items** (đủ để test)
- Click "Generate"

**Bước 4:** Xem Terminal Backend:

**Nếu thấy:**
```
🔢 Generating 15 vocabulary items, estimated tokens: 4250
✅ AI generated 15/15 vocabulary items
```
→ **ĐÂY LÀ DỮ LIỆU AI THẬT từ OpenAI** ✅

**Nếu thấy:**
```
⚠️ OpenAI API key not found
🔄 Falling back to mock data
🎭 Generating mock course data
```
→ **ĐÂY LÀ MOCK DATA** (cần check API key) ❌

### 4. **Kiểm Tra API Key**

Chạy lệnh này để xác nhận API key có tồn tại:

```powershell
cd backend
Get-Content .env | Select-String "OPENAI_API_KEY"
```

**Nếu thấy:**
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```
→ ✅ **API key có** → Dữ liệu sẽ là AI thật

**Nếu thấy:**
```
# OPENAI_API_KEY=
hoặc không có dòng này
```
→ ❌ **API key thiếu** → Dữ liệu sẽ là mock

### 5. **Code Logic (Tham Khảo)**

File: `backend/src/services/aiCourseGeneratorService.ts`

```typescript
async generateCourse(config: AIGenerationConfig): Promise<GeneratedCourse> {
  // Kiểm tra API key
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API key not found, using fallback mock data');
    return this.generateMockCourse(config);  // ← MOCK DATA
  }

  // Gọi OpenAI API
  if (config.type === 'vocabulary') {
    return await this.generateVocabularyCourse(config);  // ← AI THẬT
  }
}
```

## 📊 Bảng So Sánh Chi Tiết

| Tiêu chí | Mock Data ❌ | AI Data ✅ |
|----------|-------------|-----------|
| **Format từ** | `topic-word-1` | `segmentation` |
| **Pronunciation** | `/wɜːrd 1/` | `/ˌseɡmenˈteɪʃn/` |
| **Meaning** | "Nghĩa của từ về X số Y" | "Phân khúc thị trường, quá trình..." |
| **Example** | "This is an example using X word Y" | "Market segmentation allows companies..." |
| **Độ dài meaning** | ~30 ký tự | ~80-150 ký tự |
| **Độ dài example** | ~50 ký tự | ~100-200 ký tự |
| **Chất lượng** | Rất cơ bản | Chuyên môn, chi tiết |
| **Log backend** | `🎭 Generating mock` | `✅ AI generated X/Y` |
| **Thời gian tạo** | <1 giây | 10-30 giây |

## 🎯 Kết Luận

**Để biết chắc chắn dữ liệu của bạn là AI hay Mock:**

### ✅ **Cách 1: Xem Log Backend** (Nhanh nhất)
- Có `✅ AI generated` → AI thật
- Có `🎭 Generating mock` → Mock data

### ✅ **Cách 2: Xem Nội Dung**
- Từ như `marketing-word-1` → Mock
- Từ như `segmentation` → AI thật

### ✅ **Cách 3: Check API Key**
```powershell
cd backend; Get-Content .env | Select-String "OPENAI_API_KEY=sk-"
```
- Có kết quả → AI thật
- Không có → Mock data

---

**Giờ hãy thử tạo khóa học 15-30 câu và xem log backend để biết kết quả!** 🚀
