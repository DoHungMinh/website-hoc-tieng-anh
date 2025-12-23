import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";

export const useActivityHeartbeat = () => {
    // Atomic selectors để tối ưu performance
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const lastHeartbeatRef = useRef<number>(0);
    const isCheckingRef = useRef<boolean>(false);

    const checkAccountStatus = async () => {
        if (!user || !token || isCheckingRef.current) return;

        // Tránh spam requests - chỉ check mỗi 2 phút một lần (tăng từ 30s)
        const now = Date.now();
        if (now - lastHeartbeatRef.current < 120000) return; // Tăng từ 30 giây lên 2 phút

        isCheckingRef.current = true;
        lastHeartbeatRef.current = now;

        try {
            const response = await fetch(
                "http://localhost:5002/api/user/heartbeat",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 403) {
                const data = await response.json();
                if (data.message && data.message.includes("vô hiệu hóa")) {
                    // Trigger event để useHeartbeat hook xử lý
                    window.dispatchEvent(
                        new CustomEvent("accountDisabled", {
                            detail: { message: data.message },
                        })
                    );
                }
            }
        } catch (error) {
            console.error("Activity heartbeat failed:", error);
        } finally {
            isCheckingRef.current = false;
        }
    };

    useEffect(() => {
        if (!user || !token) return;

        // Các activity events để trigger heartbeat
        const activities = ["click", "keydown", "scroll", "mousemove"];

        const throttledCheck = () => {
            checkAccountStatus();
        };

        // Thêm event listeners
        activities.forEach((activity) => {
            document.addEventListener(activity, throttledCheck, {
                passive: true,
            });
        });

        // Backup timer: Nếu user không có activity trong 5 phút, vẫn gửi heartbeat
        const backupTimer = setInterval(() => {
            console.log("🔄 Backup activity heartbeat sent");
            checkAccountStatus();
        }, 300000); // 5 phút (tăng từ 2 phút)

        // Cleanup
        return () => {
            activities.forEach((activity) => {
                document.removeEventListener(activity, throttledCheck);
            });
            clearInterval(backupTimer);
        };
    }, [user, token]);

    return { checkAccountStatus };
};
