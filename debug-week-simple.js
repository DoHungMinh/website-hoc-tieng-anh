// Simple test to check if week calculation is working
console.log("=== WEEK CALCULATION DEBUG ===");

const now = new Date();
console.log("Current time:", now.toString());
console.log(
    "Current day of week:",
    now.getDay(),
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()]
);

const currentDay = now.getDay();
const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - daysFromMonday);
startOfWeek.setHours(0, 0, 0, 0);

const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6);
endOfWeek.setHours(23, 59, 59, 999);

console.log("Week start (Monday):", startOfWeek.toLocaleString("vi-VN"));
console.log("Week end (Sunday):", endOfWeek.toLocaleString("vi-VN"));
console.log("Week start UTC:", startOfWeek.toISOString());
console.log("Week end UTC:", endOfWeek.toISOString());

console.log("\n=== ISSUE ANALYSIS ===");
console.log("Potential issues:");
console.log("1. ❓ No payment data in current week (22-28 Sept)");
console.log("2. ❓ Timezone mismatch between server and database");
console.log("3. ❓ Authentication issues in frontend");
console.log("4. ❓ Database query not finding payments");

console.log("\n=== NEXT STEPS ===");
console.log("1. Check backend logs when PaymentManagement page loads");
console.log("2. Verify if there are any payments in database");
console.log("3. Check if frontend is calling correct endpoint");
console.log("4. Verify authentication tokens are working");
