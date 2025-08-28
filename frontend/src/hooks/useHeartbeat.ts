import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useHeartbeat = () => {
  const { user, token, forceLogout } = useAuthStore();
  const [accountDisabledMessage, setAccountDisabledMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    // Function to send heartbeat
    const sendHeartbeat = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/user/heartbeat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if account is disabled
        if (response.status === 403) {
          const data = await response.json();
          if (data.message && data.message.includes('vô hiệu hóa')) {
            setAccountDisabledMessage(data.message);
            // Không auto logout ở đây nữa, để AccountDisabledNotification component xử lý
            return;
          }
        }

        if (response.ok) {
          console.log('Heartbeat sent successfully');
        }
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    };

    // Lắng nghe custom event từ activity heartbeat
    const handleAccountDisabled = (event: CustomEvent) => {
      setAccountDisabledMessage(event.detail.message);
    };

    window.addEventListener('accountDisabled', handleAccountDisabled as EventListener);

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval to send heartbeat every 5 seconds (để phát hiện nhanh account bị khóa)
    const interval = setInterval(sendHeartbeat, 5 * 1000); // 5 giây

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('accountDisabled', handleAccountDisabled as EventListener);
    };
  }, [user, token, forceLogout]);

  return { 
    accountDisabledMessage, 
    clearAccountDisabledMessage: () => setAccountDisabledMessage(null)
  };
};
