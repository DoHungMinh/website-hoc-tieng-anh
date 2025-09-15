import { Server } from "socket.io";
import { User } from "../models/User";

interface UserActivity {
    type: "login" | "logout" | "online" | "offline";
    userId: string;
    userEmail: string;
    userName: string;
    timestamp: Date;
}

class RealtimeService {
    private io: Server | null = null;

    // Khởi tạo socket.io instance
    setSocketIO(io: Server) {
        this.io = io;
    }

    // Emit user activity event
    async emitUserActivity(activity: UserActivity) {
        if (!this.io) return;

        try {
            // Broadcast to all admin clients
            this.io.emit("user_activity", {
                type: activity.type,
                user: {
                    id: activity.userId,
                    email: activity.userEmail,
                    name: activity.userName,
                },
                timestamp: activity.timestamp,
                message: this.formatActivityMessage(activity),
            });

            // Log only if logging enabled
            if (process.env.ENABLE_REQUEST_LOGGING === "true") {
                console.log(
                    `📡 Real-time: ${activity.type.toUpperCase()} - ${
                        activity.userName
                    } (${activity.userEmail})`
                );
            }

            // Also emit updated statistics
            await this.broadcastUpdatedStats();
        } catch (error) {
            console.error("Error emitting user activity:", error);
        }
    }

    // Emit updated statistics to admin dashboard
    async broadcastUpdatedStats() {
        if (!this.io) return;

        try {
            const now = new Date();

            // Get current online users
            const onlineUsers = await User.countDocuments({ isOnline: true });

            // Get recent visitors (last 5 minutes)
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            const recentVisitors = await User.countDocuments({
                lastSeen: { $gte: fiveMinutesAgo },
            });

            // Get visitors in last hour
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const visitorsLastHour = await User.countDocuments({
                lastSeen: { $gte: oneHourAgo },
            });

            // Get visitors today
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const visitorsToday = await User.countDocuments({
                lastSeen: { $gte: startOfDay },
            });

            const realtimeData = {
                onlineUsers,
                recentVisitors,
                visitorsLastHour,
                visitorsToday,
                timestamp: now.toISOString(),
            };

            // Broadcast to admin dashboard
            this.io.emit("statistics_update", {
                type: "realtime",
                data: realtimeData,
            });
        } catch (error) {
            console.error("Error broadcasting updated stats:", error);
        }
    }

    // Format activity message for display
    private formatActivityMessage(activity: UserActivity): string {
        const time = activity.timestamp.toLocaleTimeString("vi-VN");

        switch (activity.type) {
            case "login":
                return `${activity.userName} đã đăng nhập lúc ${time}`;
            case "logout":
                return `${activity.userName} đã đăng xuất lúc ${time}`;
            case "online":
                return `${activity.userName} đang online`;
            case "offline":
                return `${activity.userName} đã offline lúc ${time}`;
            default:
                return `${activity.userName} có hoạt động lúc ${time}`;
        }
    }

    // Emit recent activity for dashboard
    async emitRecentActivity(activity: {
        type: string;
        action: string;
        userEmail?: string;
        userName?: string;
    }) {
        if (!this.io) return;

        try {
            const now = new Date();
            const timeAgo = this.getTimeAgo(now);

            const recentActivity = {
                type: activity.type,
                action: activity.action,
                time: now.toLocaleTimeString("vi-VN"),
                timeAgo,
                timestamp: now.toISOString(),
                userEmail: activity.userEmail,
                userName: activity.userName,
                icon: this.getActivityIcon(activity.type),
                color: this.getActivityColor(activity.type),
            };

            // Broadcast to admin dashboard
            this.io.emit("recent_activity", recentActivity);
        } catch (error) {
            console.error("Error emitting recent activity:", error);
        }
    }

    // Helper: Get activity icon
    private getActivityIcon(type: string): string {
        switch (type) {
            case "login":
                return "🔑";
            case "logout":
                return "👋";
            case "register":
                return "✨";
            case "test_submit":
                return "📝";
            case "course_enroll":
                return "📚";
            default:
                return "🔄";
        }
    }

    // Helper: Get activity color
    private getActivityColor(type: string): string {
        switch (type) {
            case "login":
                return "green";
            case "logout":
                return "yellow";
            case "register":
                return "blue";
            case "test_submit":
                return "purple";
            case "course_enroll":
                return "indigo";
            default:
                return "gray";
        }
    }

    // Helper: Get time ago string
    private getTimeAgo(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày trước`;
    }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
