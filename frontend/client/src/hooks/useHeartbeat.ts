import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "@/utils/constants";

export const useHeartbeat = () => {
    // Atomic selectors để tối ưu performance
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const forceLogout = useAuthStore((state) => state.forceLogout);
    const [accountDisabledMessage, setAccountDisabledMessage] = useState<
        string | null
    >(null);

    useEffect(() => {
        if (!user || !token) return;

        // Function to send heartbeat
        const sendHeartbeat = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
                
                const response = await fetch(
                    `${API_BASE_URL}/user/heartbeat`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        signal: controller.signal,
                    }
                );
                
                clearTimeout(timeoutId);

                // Check if account is disabled
                if (response.status === 403) {
                    const data = await response.json();
                    if (data.message && data.message.includes("vô hiệu hóa")) {
                        setAccountDisabledMessage(data.message);
                        // Không auto logout ở đây nữa, để AccountDisabledNotification component xử lý
                        return;
                    }
                }

                if (response.ok) {
                    console.log("Heartbeat sent successfully");
                }
            } catch (error) {
                // Gracefully handle errors - backend may be restarting
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        console.warn("⏱️ Heartbeat timeout - backend may be busy");
                    } else if (error.message.includes('Failed to fetch')) {
                        console.warn("🔌 Backend connection lost - may be restarting");
                    } else {
                        console.error("❌ Heartbeat error:", error.message);
                    }
                }
                // Don't crash - just log and continue
            }
        };

        // Lắng nghe custom event từ activity heartbeat
        const handleAccountDisabled = (event: CustomEvent) => {
            setAccountDisabledMessage(event.detail.message);
        };

        window.addEventListener(
            "accountDisabled",
            handleAccountDisabled as EventListener
        );

        // Send initial heartbeat
        sendHeartbeat();

        // Set up interval to send heartbeat every 25 seconds (tối ưu để tránh quá tải)
        const interval = setInterval(sendHeartbeat, 25 * 1000); // 25 giây

        // Function to set user offline when page is unloaded
        const handleBeforeUnload = async () => {
            try {
                // Use sendBeacon for reliable delivery even when page is closing
                const data = new Blob(
                    [JSON.stringify({ action: "offline", token: token })],
                    { type: "application/json" }
                );
                navigator.sendBeacon(
                    `${API_BASE_URL}/user/offline`,
                    data
                );
            } catch (error) {
                console.error("Failed to set user offline:", error);
            }
        };

        // Listen for page unload events
        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("pagehide", handleBeforeUnload);

        // Cleanup interval on unmount
        return () => {
            clearInterval(interval);
            window.removeEventListener(
                "accountDisabled",
                handleAccountDisabled as EventListener
            );
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("pagehide", handleBeforeUnload);
        };
    }, [user, token, forceLogout]);

    return {
        accountDisabledMessage,
        clearAccountDisabledMessage: () => setAccountDisabledMessage(null),
    };
};
