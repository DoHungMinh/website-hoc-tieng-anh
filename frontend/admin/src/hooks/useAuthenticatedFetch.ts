import { useAuthStore } from '@/stores/authStore';

// Custom fetch wrapper that handles account disabled errors
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {

  try {
    const response = await fetch(url, options);

    // Check for account disabled error
    if (response.status === 403) {
      try {
        const data = await response.clone().json();
        if (data.message && data.message.includes('vô hiệu hóa')) {
          // KHÔNG auto logout ở đây nữa - để heartbeat xử lý
          console.log('🔒 Account disabled intercepted by useAuthenticatedFetch:', data.message);
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
  // Atomic selectors để tối ưu performance
  const token = useAuthStore((state) => state.token);

  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    // safely construct headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(url, {
      ...options,
      headers,
    });

    return response;
  };
};
