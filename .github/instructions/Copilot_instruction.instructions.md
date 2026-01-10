COPILOT CONTEXT - ENGLISH_LEARNING_PROJECT

Tài liệu này cung cấp bối cảnh kỹ thuật toàn diện của dự án ENGLISH_LEARNING_PROJECT để GitHub Copilot có thể hỗ trợ hiệu quả nhất.

### **1. Cách viết code tôi hướng đến là**
- Clean Code
- Tối ưu hiệu suất      
- Tránh các lỗi Anti-pattern phổ biến
- DRY principle
- SRP cấp function

### **2.Những điều cần phải xem kỹ trước khi trả lời **
[cite\_start] trước khi làm việc với code hay thực thi điều gì đó liên quan đến sửa file hay code hãy hỏi ý kiến của tôi trước, khi tôi xác nhận mới được hành động. Tiếp đó khi chỉnh sửa gì code hãy nhỡ là phải giữ được logic, tông màu, ui,ux và các chức năng của tôi đã làm không bị ảnh hưởng và hoạt động bình thường nhé. 
[cite\_end]

[cite\_start] khi trả lời tôi hãy sử dụng tiếng việt để giao tiếp
[cite\_end]

[cite\_start] khi tôi muốn hỏi gì đó mà bạn cần trả lời thì hãy trả lời trực tiếp qua đoạn chat đừng có tạo file .md nhé 
[cite\_end]

[cite\_start] khi trả lời tôi bằng đoạn code hãy ghi rõ đường dẫn của đoạn code đấy ở đâu trong dự án để tôi dễ dàng tìm kiếm
[cite\_end]

[cite\_start] trả lời tôi khi tôi hỏi về một vấn đề nào đó hãy đưa ra tôi các testcase hay các trường hợp logic có thể sảy ra liên quan, ảnh hưởng đến logic cũng như chức năng của tôi đang làm để tôi dễ dàng kiểm soát và đánh giá hơn nhé.
[cite\_end]

[cite\_start] khi tôi yêu cầu bạn sửa code trong dự án hãy sửa theo bình thường và chuẩn theo các file  đã được cung cấp hãy cứ làm thật chuyên nghiệp và quy chuẩn theo các nội dung đã được cung cấp ở file 
[cite\_end]

[cite\_start] Trước khi sửa code của chức năng gì hãy đọc kỹ các file liên quan đến chức năng đó thật kỹ đểu hiểu cấu trúc file và file đó làm gì, bên cạnh đó phải hiếu cấu trúc file đó và các phân chia chức năng trong file đó như thế nào (vd: controller, service, route, model, util...) để khi sửa code không làm ảnh hưởng đến các chức năng khác và giữ được tính module hóa trong dự án (ví dụ minh họa phần sử lý logic là của service trong backend và controller chỉ gọi service chứ không xử lý logic trong controller) kiểu như vậy nhé. 
[cite\_end]

[cite\_start] trước khi code hãy đọc thật kỹ các file tôi đã gửi đính kèm để hiểu rõ hơn code. Bên cạnh đó làm chức năng nào phải đọc kỹ tất cả các file liên quan đến chức năng đó không được bỏ sót file nào để hiểu rõ cấu trúc và cách hoạt động của chức năng đó. Bạn đang bị lỗi là không chịu đọc kỹ các file liên quan mà làm luôn code dẫn đến bị lỗi tùm lum, hãy nhớ kỹ điều này nhé.
[cite\_end]