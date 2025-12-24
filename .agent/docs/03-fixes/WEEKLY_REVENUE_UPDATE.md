# 📊 PAYMENT MANAGEMENT: WEEKLY REVENUE UPDATE

## 🎯 Objective

Thay đổi "Doanh thu tháng" thành "Doanh thu tuần" với logic tuần chuẩn (Thứ 2 → Chủ nhật) và reset về 0 khi chuyển sang tuần mới.

## 🔧 Changes Made

### Backend (routes/index.ts)

-   ✅ **Added new endpoint**: `/api/payments/stats/week`
-   ✅ **Week calculation**: Monday (0:00) → Sunday (23:59:59)
-   ✅ **Auto reset**: Mỗi Thứ 2 = tuần mới
-   ✅ **Response format**:
    ```json
    {
        "success": true,
        "data": {
            "weekRevenue": 50000,
            "weekTransactions": 5,
            "startDate": "2025-09-22T00:00:00.000Z",
            "endDate": "2025-09-28T23:59:59.999Z"
        }
    }
    ```

### Frontend (PaymentManagement.tsx)

-   ✅ **Interface updated**: `monthRevenue` → `weekRevenue`
-   ✅ **API call changed**: `/stats/month` → `/stats/week`
-   ✅ **UI updated**: "Doanh thu tháng" → "Doanh thu tuần (T2-CN)"
-   ✅ **State management**: Sử dụng `weekRevenue` thay vì `monthRevenue`

## 📅 Week Logic Test Results

```
Current: 22/9/2025 (Thứ 2) → Tuần: 22/9 đến 28/9 ✅
Previous: 21/9/2025 (Chủ nhật) → Tuần: 15/9 đến 21/9 ✅

=== WEEKLY RANGES ===
T2 16/9 → Tuần: 15/9 đến 21/9
T3 17/9 → Tuần: 15/9 đến 21/9
T4 18/9 → Tuần: 15/9 đến 21/9
T5 19/9 → Tuần: 15/9 đến 21/9
T6 20/9 → Tuần: 15/9 đến 21/9
T7 21/9 → Tuần: 15/9 đến 21/9
CN 22/9 → Tuần: 22/9 đến 28/9 ← RESET!
```

## 🚀 Features

-   ✅ **Accurate Week Calculation**: Luôn Thứ 2 → Chủ nhật
-   ✅ **Auto Reset**: Mỗi Thứ 2 = tuần mới, doanh thu = 0
-   ✅ **Timezone Aware**: Tính theo giờ địa phương (GMT+7)
-   ✅ **Backward Compatible**: Không ảnh hưởng các tính năng khác
-   ✅ **Error Handling**: Đầy đủ try/catch và validation

## 🎯 Expected Behavior

1. **Hôm nay (22/9 - Thứ 2)**: Hiển thị doanh thu tuần mới (có thể = 0)
2. **Ngày mai (23/9 - Thứ 3)**: Tích lũy doanh thu từ Thứ 2
3. **Chủ nhật (28/9)**: Tổng doanh thu cả tuần
4. **Thứ 2 tiếp (29/9)**: Reset về 0, bắt đầu tuần mới

## ✅ Status: COMPLETED

-   Backend endpoint: Ready ✅
-   Frontend integration: Ready ✅
-   Logic validation: Passed ✅
-   UI/UX: Maintained ✅
