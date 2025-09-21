# Console Logs Giải Thích

## Revenue Timeframe Logs

Khi bạn thấy nhiều logs về "Revenue timeframe" trong console, đây là lý do:

### 📊 **Revenue Period Changed to: [period]**

-   **Khi nào:** Mỗi khi bạn thay đổi dropdown Tuần/Tháng/Năm
-   **Nguyên nhân:** useEffect được trigger để fetch data mới
-   **Bình thường:** Đây là hành vi mong muốn

### 🎛️ **[Revenue Card] Changing to: [period]**

-   **Vị trí:** Dropdown trong card "Doanh thu" (phía trên)
-   **Mục đích:** Thay đổi giá trị hiển thị trong card

### 📊 **[Revenue Chart] Changing to: [period]**

-   **Vị trí:** Dropdown trong biểu đồ "Doanh thu" (phía dưới)
-   **Mục đích:** Thay đổi dữ liệu biểu đồ

### Tại sao có 2 dropdown?

1. **Revenue Card**: Hiển thị số liệu tổng (trong phần overview)
2. **Revenue Chart**: Hiển thị biểu đồ chi tiết (trong phần charts)

Cả 2 đều dùng chung state `revenueTimeframe`, nên khi thay đổi 1 cái thì cả 2 đều update.

### Logs bình thường khi thay đổi:

```
📊 Revenue period changed to: week
🎛️ [Revenue Card] Changing to: week
✅ [Revenue Card] Changed successfully
📊 [Revenue Chart] Changing to: week
✅ [Revenue Chart] Changed successfully
✅ Data updated for period: week
```

Đây là hoạt động bình thường, không phải lỗi!
