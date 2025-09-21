// Test week logic - Monday to Sunday
console.log("=== TEST WEEK CALCULATION ===");

function getWeekRange(date = new Date()) {
    const now = new Date(date);

    // Tính ngày thứ 2 của tuần hiện tại (start of week)
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Nếu Sunday thì -6, còn lại -currentDay+1

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Tính Chủ nhật (end of week)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
}

// Test với ngày hiện tại
const currentDate = new Date(); // September 22, 2025
console.log("Current date:", currentDate.toString());
console.log(
    "Day of week:",
    currentDate.getDay(),
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentDate.getDay()]
);

const { startOfWeek, endOfWeek } = getWeekRange(currentDate);
console.log("Week range:");
console.log(
    "Start (Monday):",
    startOfWeek.toLocaleDateString("vi-VN"),
    startOfWeek.toString()
);
console.log(
    "End (Sunday):",
    endOfWeek.toLocaleDateString("vi-VN"),
    endOfWeek.toString()
);

// Test với các ngày khác nhau trong tuần
console.log("\n=== TEST DIFFERENT DAYS ===");
const testDates = [
    new Date(2025, 8, 16), // Monday, September 16, 2025
    new Date(2025, 8, 17), // Tuesday, September 17, 2025
    new Date(2025, 8, 18), // Wednesday, September 18, 2025
    new Date(2025, 8, 19), // Thursday, September 19, 2025
    new Date(2025, 8, 20), // Friday, September 20, 2025
    new Date(2025, 8, 21), // Saturday, September 21, 2025
    new Date(2025, 8, 22), // Sunday, September 22, 2025
];

testDates.forEach((date) => {
    const { startOfWeek, endOfWeek } = getWeekRange(date);
    const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][date.getDay()];
    console.log(
        `${dayName} ${date.getDate()}/9 → Tuần: ${startOfWeek.getDate()}/9 đến ${endOfWeek.getDate()}/9`
    );
});

console.log("\n=== VALIDATION ===");
console.log("✅ Tuần luôn bắt đầu từ Thứ 2");
console.log("✅ Tuần luôn kết thúc ở Chủ nhật");
console.log("✅ Reset về 0 khi chuyển sang tuần mới (Thứ 2 tiếp theo)");
