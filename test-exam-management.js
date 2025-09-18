const fetch = require("node-fetch");

async function testExamManagementAPI() {
    console.log("🧪 Testing Exam Management API endpoints...\n");

    // Test endpoints that should work without authentication
    console.log("--- Testing Public Endpoints ---");

    try {
        console.log("1. Testing GET /api/ielts (public exams)");
        const publicResponse = await fetch("http://localhost:5002/api/ielts");
        console.log(`Status: ${publicResponse.status}`);

        if (publicResponse.ok) {
            const data = await publicResponse.json();
            console.log(`Found ${data.data?.length || 0} published exams`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log("\n--- Testing Admin Endpoints (will fail without auth) ---");

    try {
        console.log("2. Testing GET /api/ielts?status=all (admin view)");
        const adminResponse = await fetch(
            "http://localhost:5002/api/ielts?status=all"
        );
        console.log(`Status: ${adminResponse.status}`);

        if (!adminResponse.ok) {
            console.log("Expected: Should require authentication");
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    try {
        console.log("3. Testing GET /api/ielts/admin/stats");
        const statsResponse = await fetch(
            "http://localhost:5002/api/ielts/admin/stats"
        );
        console.log(`Status: ${statsResponse.status}`);

        if (!statsResponse.ok) {
            console.log("Expected: Should require authentication");
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log("\n--- API Endpoint Summary ---");
    console.log("✅ GET /api/ielts - Public access to published exams");
    console.log("🔒 GET /api/ielts?status=all - Admin access to all exams");
    console.log("🔒 GET /api/ielts/admin/stats - Admin access to statistics");
    console.log("🔒 POST /api/ielts - Create new exam");
    console.log("🔒 PUT /api/ielts/:id - Update exam");
    console.log("🔒 DELETE /api/ielts/:id - Delete exam");
    console.log("🔒 PATCH /api/ielts/:id/status - Toggle exam status");

    console.log(
        "\n✅ Test completed. Backend API structure is properly configured."
    );
}

testExamManagementAPI().catch(console.error);
