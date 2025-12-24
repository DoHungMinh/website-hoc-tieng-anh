import { STORAGE_KEYS } from './constants';

/**
 * Sync token giữa 2 keys để đảm bảo tương thích
 * - STORAGE_KEYS.TOKEN: cho user components (PayOS, email)
 * - 'token': cho admin components
 */
export const syncTokens = () => {
  const mainToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const adminToken = localStorage.getItem('token');
  
  // Nếu có mainToken nhưng không có adminToken -> copy sang
  if (mainToken && !adminToken) {
    localStorage.setItem('token', mainToken);
    console.log('✅ Synced token to admin key');
  }
  
  // Nếu có adminToken nhưng không có mainToken -> copy sang  
  if (adminToken && !mainToken) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, adminToken);
    console.log('✅ Synced token to main key');
  }
};

/**
 * Set token cho cả 2 keys
 */
export const setToken = (token: string) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem('token', token);
};

/**
 * Remove token từ cả 2 keys
 */
export const removeTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem('token');
};

/**
 * Get token từ key nào có sẵn
 */
export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
};