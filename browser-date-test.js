// Test actual browser date handling
console.log("=== BROWSER DATE TEST ===");

// Test current date
const now = new Date();
console.log("Current browser time:", now.toString());

// OLD method - using toISOString
const oldMax = now.toISOString().split("T")[0];
console.log("OLD getMaxDate():", oldMax);

// NEW method - using local timezone
const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const newMax = formatDateForInput(now);
console.log("NEW getMaxDate():", newMax);

console.log("\n=== COMPARISON ===");
console.log("Date difference:", oldMax === newMax ? "SAME" : "DIFFERENT");
console.log(
    "User can select current date:",
    newMax >= new Date().toISOString().split("T")[0] ? "YES ✅" : "NO ❌"
);

// Test edge case: late night (23:xx)
const lateNight = new Date();
lateNight.setHours(23, 59, 59);
console.log("\n=== LATE NIGHT TEST (23:59) ===");
console.log("Late night time:", lateNight.toString());
console.log("OLD:", lateNight.toISOString().split("T")[0]);
console.log("NEW:", formatDateForInput(lateNight));
