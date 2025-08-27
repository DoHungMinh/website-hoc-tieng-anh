import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useHeartbeat = () => {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) return;

    // Function to send heartbeat
    const sendHeartbeat = async () => {
      try {
        await fetch('http://localhost:5002/api/user/heartbeat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Heartbeat sent successfully');
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval to send heartbeat every 2 minutes
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000); // 2 minutes

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [user, token]);
};
