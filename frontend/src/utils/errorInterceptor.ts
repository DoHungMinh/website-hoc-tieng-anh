import { useAuthStore } from '../stores/authStore';

// Global error interceptor for handling account disabled
export const setupGlobalErrorInterceptor = (): void => {
  // Intercept fetch requests
  const originalFetch = window.fetch;
  
  window.fetch = async (...args): Promise<Response> => {
    try {
      const response = await originalFetch(...args);
      
      // Check for 403 errors
      if (response.status === 403) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          
          // Check if it's an account disabled error
          if (data.message && data.message.includes('vô hiệu hóa')) {
            // KHÔNG auto logout ở đây nữa - để heartbeat và AccountDisabledNotification xử lý
            console.log('🔒 Account disabled intercepted by global error interceptor:', data.message);
            // const { forceLogout } = useAuthStore.getState();
            // forceLogout(data.message);
          }
        } catch (e) {
          // If we can't parse the response, ignore
          console.error('Error parsing 403 response:', e);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
};

// Interceptor specifically for API calls with auth headers
export const handleApiError = (error: any): void => {
  if (error && error.message) {
    // Check for account disabled messages
    if (error.message.includes('vô hiệu hóa') || error.message.includes('disabled')) {
      const { forceLogout } = useAuthStore.getState();
      forceLogout(error.message);
    }
  }
};
