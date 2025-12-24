/**
 * Timezone utility functions for Vietnam (+7 UTC)
 */

/**
 * Format date to Vietnam timezone (+7)
 * @param dateString - ISO date string from MongoDB
 * @returns Formatted date string in Vietnamese format (HH:mm DD/MM/YYYY)
 */
export const formatDateVN = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
        // Parse the input date string
        const utcDate = new Date(dateString);

        // Validate the date
        if (isNaN(utcDate.getTime())) {
            console.warn("Invalid date string:", dateString);
            return "N/A";
        }

        // Convert UTC to Vietnam timezone (+7 hours)
        const vietnamTimeMs = utcDate.getTime() + 7 * 60 * 60 * 1000;
        const vietnamDate = new Date(vietnamTimeMs);

        // Extract components and format manually
        const hours = vietnamDate.getUTCHours().toString().padStart(2, "0");
        const minutes = vietnamDate.getUTCMinutes().toString().padStart(2, "0");
        const day = vietnamDate.getUTCDate().toString().padStart(2, "0");
        const month = (vietnamDate.getUTCMonth() + 1)
            .toString()
            .padStart(2, "0");
        const year = vietnamDate.getUTCFullYear();

        // Format: HH:mm DD/MM/YYYY
        const result = `${hours}:${minutes} ${day}/${month}/${year}`;

        return result;
    } catch (error) {
        console.error("Error formatting date to Vietnam timezone:", error);
        return "N/A";
    }
};

/**
 * Format date to Vietnam timezone (date only)
 * @param dateString - ISO date string from MongoDB
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDateOnlyVN = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "N/A";
        }

        // Manual conversion to Vietnam timezone (UTC+7)
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

        const day = vietnamTime.getUTCDate().toString().padStart(2, "0");
        const month = (vietnamTime.getUTCMonth() + 1)
            .toString()
            .padStart(2, "0");
        const year = vietnamTime.getUTCFullYear();

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
    }
};

/**
 * Format date to Vietnam timezone with full details
 * @param dateString - ISO date string from MongoDB
 * @returns Formatted date string with weekday
 */
export const formatDateFullVN = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
    }
};

/**
 * Get current date in Vietnam timezone
 * @returns Current date string in Vietnamese format
 */
export const getCurrentDateVN = (): string => {
    const now = new Date();
    return formatDateVN(now.toISOString());
};

/**
 * Convert UTC date to Vietnam timezone Date object
 * @param dateString - ISO date string from MongoDB
 * @returns Date object adjusted to Vietnam timezone
 */
export const toVietnamTime = (dateString?: string): Date | null => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return null;
        }

        // Add 7 hours to convert UTC to Vietnam time
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        return vietnamTime;
    } catch (error) {
        console.error("Error converting to Vietnam time:", error);
        return null;
    }
};

/**
 * Format date range for display (Vietnam timezone)
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Formatted range string
 */
export const formatDateRange = (
    startDate?: string,
    endDate?: string
): string => {
    if (!startDate && !endDate) return "Tất cả thời gian";

    if (startDate && endDate) {
        const start = formatDateOnlyVN(startDate + "T00:00:00.000Z");
        const end = formatDateOnlyVN(endDate + "T23:59:59.999Z");
        return `${start} - ${end}`;
    }

    if (startDate) {
        const start = formatDateOnlyVN(startDate + "T00:00:00.000Z");
        return `Từ ${start}`;
    }

    if (endDate) {
        const end = formatDateOnlyVN(endDate + "T23:59:59.999Z");
        return `Đến ${end}`;
    }

    return "";
};
