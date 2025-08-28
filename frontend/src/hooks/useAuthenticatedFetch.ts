import { useAuthStore } from '../stores/authStore';

// Custom fetch wrapper that handles account disabled errors
export const fetchWithAuth = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const { forceLogout } = useAuthStore.getState();
  
  try {
    const response = await fetch(url, options);
    
    // Check for account disabled error
    if (response.status === 403) {
      try {
        const data = await response.clone().json();
        if (data.message && data.message.includes('vô hiệu hóa')) {
          // KHÔNG auto logout ở đây nữa - để heartbeat xử lý
          console.log('🔒 Account disabled intercepted by useAuthenticatedFetch:', data.message);
          // forceLogout(data.message);
        }
      } catch (e) {
        // If can't parse JSON, continue with original response
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Hook to get authenticated fetch function
export const useAuthenticatedFetch = () => {
  const { token, forceLogout } = useAuthStore();
  
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetchWithAuth(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      }
    });
    
    return response;
  };
};
