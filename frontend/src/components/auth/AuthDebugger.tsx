import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { STORAGE_KEYS } from '@/utils/constants';

export const AuthDebugger: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [showDebug, setShowDebug] = useState(false);

  const handleForceLogout = () => {
    // Clear all authentication data
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('user'); // fallback
    localStorage.removeItem('token'); // fallback
    
    // Clear auth store
    logout();
    
    // Refresh page to ensure clean state
    window.location.reload();
  };

  const getTokenInfo = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        exp: new Date(payload.exp * 1000).toLocaleString()
      };
    } catch (error) {
      return { error: 'Invalid token format' };
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug Auth
      </button>
    );
  }

  const tokenInfo = getTokenInfo();

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Auth Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Store User:</strong> {user ? user.email : 'Not logged in'}
        </div>
        
        <div>
          <strong>Store Role:</strong> {user?.role || 'N/A'}
        </div>
        
        <div>
          <strong>Store ID:</strong> {user?.id || 'N/A'}
        </div>
        
        <div>
          <strong>LocalStorage Token:</strong> {localStorage.getItem(STORAGE_KEYS.TOKEN) ? 'Present' : 'Missing'}
        </div>
        
        {tokenInfo && (
          <div>
            <strong>Token Info:</strong>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <button
          onClick={handleForceLogout}
          className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
        >
          Force Logout & Refresh
        </button>
        
        <button
          onClick={() => {
            console.log('Current Auth State:', {
              user,
              token: localStorage.getItem(STORAGE_KEYS.TOKEN),
              tokenInfo
            });
          }}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Log Auth State to Console
        </button>
      </div>
    </div>
  );
};