// Test IELTS scoring with RAW correct answers (no scaling)
// User requirement: 3 correct out of 13 questions = Band score for 3/40 directly

function testScoring() {
    const correctAnswers = 3;
    const actualTotalQuestions = 13;
    
    console.log("=== FINAL CORRECT LOGIC (RAW SCORING) ===");
    
    // Calculate percentage based on actual test
    const percentage = Math.round((correctAnswers / actualTotalQuestions) * 100);
    
    // Band score lookup using RAW correct answers (no scaling)
    const bandLookupValue = correctAnswers; // Use 3 directly, not scaled
    
    console.log(`Actual test: ${correctAnswers}/${actualTotalQuestions} = ${percentage}%`);
    console.log(`Band score lookup: ${bandLookupValue}/40 (raw correct answers)`);
    
    // Band score lookup for RAW value
    const readingBandScores = {
        40: 9.0, 39: 9.0,
        38: 8.5, 37: 8.5, 36: 8.5,
        35: 8.0, 34: 8.0, 33: 8.0,
        32: 7.5, 31: 7.5, 30: 7.5,
        29: 7.0, 28: 7.0, 27: 7.0,
        26: 6.5, 25: 6.5, 24: 6.5, 23: 6.5,
        22: 6.0, 21: 6.0, 20: 6.0,
        19: 5.5, 18: 5.5, 17: 5.5, 16: 5.5, 15: 5.5,
        14: 5.0, 13: 5.0, 12: 5.0,
        11: 4.5, 10: 4.5, 9: 4.5,
        8: 4.0, 7: 4.0, 6: 4.0,
        5: 3.5, 4: 3.5, 3: 3.5,
        2: 3.0, 1: 3.0,
        0: 0.0
    };
    
    const bandScore = readingBandScores[bandLookupValue] || 0.0;
    console.log(`Band Score: ${bandScore}`);
    
    console.log("\n=== RESULT DISPLAY ===");
    console.log(`Display: ${correctAnswers}/${actualTotalQuestions} (${percentage}%) - Band ${bandScore}`);
    console.log("✅ Shows actual questions answered correctly");
    console.log("✅ Shows actual percentage based on test length"); 
    console.log("✅ Band score based on RAW correct answers (3/40)");
    
    console.log("\n=== EDGE CASES ===");
    
    // Test case: 1/13 
    const case1_correct = 1;
    const case1_percentage = Math.round((case1_correct / actualTotalQuestions) * 100);
    const case1_band = readingBandScores[case1_correct] || 0.0;
    console.log(`Case 1/13: ${case1_correct}/${actualTotalQuestions} = ${case1_percentage}% → ${case1_correct}/40 → Band ${case1_band}`);
    
    // Test case: 13/13 (perfect but limited by test length)
    const case2_correct = 13;
    const case2_percentage = Math.round((case2_correct / actualTotalQuestions) * 100);
    const case2_band = readingBandScores[case2_correct] || 0.0;
    console.log(`Case 13/13: ${case2_correct}/${actualTotalQuestions} = ${case2_percentage}% → ${case2_correct}/40 → Band ${case2_band}`);
    
    // Test case: 40/40 (theoretical max)
    const case3_correct = 40;
    const case3_totalQuestions = 40;
    const case3_percentage = Math.round((case3_correct / case3_totalQuestions) * 100);
    const case3_band = readingBandScores[case3_correct] || 0.0;
    console.log(`Case 40/40: ${case3_correct}/${case3_totalQuestions} = ${case3_percentage}% → ${case3_correct}/40 → Band ${case3_band}`);
}

testScoring();
