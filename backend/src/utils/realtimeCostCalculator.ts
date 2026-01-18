import { IRealtimeSession, ITokenUsage } from '../models/RealtimeSession';

/**
 * Realtime Cost Calculator
 * Tính toán chi phí cho OpenAI Realtime API sessions
 */

// Pricing for gpt-4o-mini-realtime-preview (as of Jan 2026)
const PRICING = {
    TEXT_INPUT: 0.60 / 1_000_000,      // $0.60 per 1M tokens
    TEXT_OUTPUT: 2.40 / 1_000_000,     // $2.40 per 1M tokens
    AUDIO_INPUT: 10.00 / 1_000_000,    // $10.00 per 1M tokens
    AUDIO_OUTPUT: 20.00 / 1_000_000,   // $20.00 per 1M tokens
};

// Legacy pricing for comparison
const LEGACY_PRICING = {
    WHISPER: 0.006 / 60,               // $0.006 per minute
    GPT4: 0.03 / 1000,                 // $0.03 per 1K input tokens
    GPT4_OUTPUT: 0.06 / 1000,          // $0.06 per 1K output tokens
    TTS: 0.015 / 1000,                 // $0.015 per 1K characters
};

/**
 * Calculate cost for a Realtime API session
 */
export function calculateRealtimeCost(tokenUsage: ITokenUsage): number {
    const textInputCost = tokenUsage.inputTokens * PRICING.TEXT_INPUT;
    const textOutputCost = tokenUsage.outputTokens * PRICING.TEXT_OUTPUT;
    const audioInputCost = tokenUsage.audioInputTokens * PRICING.AUDIO_INPUT;
    const audioOutputCost = tokenUsage.audioOutputTokens * PRICING.AUDIO_OUTPUT;

    return textInputCost + textOutputCost + audioInputCost + audioOutputCost;
}

/**
 * Calculate cost breakdown for a session
 */
export function calculateCostBreakdown(tokenUsage: ITokenUsage): {
    textInput: number;
    textOutput: number;
    audioInput: number;
    audioOutput: number;
    total: number;
} {
    const textInput = tokenUsage.inputTokens * PRICING.TEXT_INPUT;
    const textOutput = tokenUsage.outputTokens * PRICING.TEXT_OUTPUT;
    const audioInput = tokenUsage.audioInputTokens * PRICING.AUDIO_INPUT;
    const audioOutput = tokenUsage.audioOutputTokens * PRICING.AUDIO_OUTPUT;

    return {
        textInput,
        textOutput,
        audioInput,
        audioOutput,
        total: textInput + textOutput + audioInput + audioOutput,
    };
}

/**
 * Compare Realtime API cost with legacy implementation
 */
export function compareWithLegacyCost(
    transcriptDurationSeconds: number,
    responseLength: number
): {
    legacy: number;
    realtime: number;
    savings: number;
    savingsPercent: number;
} {
    // Legacy cost: Whisper + GPT-4 + TTS
    const whisperCost = (transcriptDurationSeconds / 60) * LEGACY_PRICING.WHISPER;
    const gptInputCost = (responseLength / 4) * LEGACY_PRICING.GPT4; // Estimate ~4 chars per token
    const gptOutputCost = (responseLength / 4) * LEGACY_PRICING.GPT4_OUTPUT;
    const ttsCost = responseLength * LEGACY_PRICING.TTS;
    const legacyCost = whisperCost + gptInputCost + gptOutputCost + ttsCost;

    // Realtime cost estimate (based on average 30s conversation)
    // Typical usage: ~50 input tokens, ~100 output tokens, ~500 audio tokens each way
    const estimatedTokenUsage: ITokenUsage = {
        inputTokens: 50,
        outputTokens: 100,
        audioInputTokens: Math.floor(transcriptDurationSeconds * 16.67), // ~16.67 tokens per second
        audioOutputTokens: Math.floor(transcriptDurationSeconds * 16.67),
    };
    const realtimeCost = calculateRealtimeCost(estimatedTokenUsage);

    const savings = legacyCost - realtimeCost;
    const savingsPercent = (savings / legacyCost) * 100;

    return {
        legacy: legacyCost,
        realtime: realtimeCost,
        savings,
        savingsPercent,
    };
}

/**
 * Estimate tokens from audio duration
 * OpenAI Realtime API uses ~16.67 tokens per second of audio
 */
export function estimateAudioTokens(durationSeconds: number): number {
    return Math.floor(durationSeconds * 16.67);
}

/**
 * Estimate tokens from text
 * Rough estimate: ~4 characters per token
 */
export function estimateTextTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
    if (cost < 0.001) {
        return `$${(cost * 1000).toFixed(4)}m`; // Show in millidollars
    }
    return `$${cost.toFixed(4)}`;
}

/**
 * Log cost breakdown to console
 */
export function logCostBreakdown(session: IRealtimeSession): void {
    const breakdown = calculateCostBreakdown(session.tokenUsage);

    console.log('📊 Realtime API Cost Breakdown:');
    console.log(`  - Text input:    ${formatCost(breakdown.textInput)} (${session.tokenUsage.inputTokens} tokens)`);
    console.log(`  - Text output:   ${formatCost(breakdown.textOutput)} (${session.tokenUsage.outputTokens} tokens)`);
    console.log(`  - Audio input:   ${formatCost(breakdown.audioInput)} (${session.tokenUsage.audioInputTokens} tokens)`);
    console.log(`  - Audio output:  ${formatCost(breakdown.audioOutput)} (${session.tokenUsage.audioOutputTokens} tokens)`);
    console.log(`  - Total:         ${formatCost(breakdown.total)}`);

    // Compare with legacy
    const comparison = compareWithLegacyCost(session.totalDuration,
        session.messages.reduce((sum, m) => sum + m.content.length, 0)
    );

    console.log(`\n💰 Savings vs Legacy:`);
    console.log(`  - Legacy cost:   ${formatCost(comparison.legacy)}`);
    console.log(`  - Realtime cost: ${formatCost(comparison.realtime)}`);
    console.log(`  - Savings:       ${formatCost(comparison.savings)} (${comparison.savingsPercent.toFixed(1)}%)`);
}
