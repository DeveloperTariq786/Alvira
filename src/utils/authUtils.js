// Utility functions for authentication
export const AUTH_TOKEN_KEY = 'token';

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Decode and check token expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      removeAuthToken();
      return false;
    }
    return true;
  } catch (error) {
    removeAuthToken();
    return false;
  }
};

export const getAuthUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    // Decode token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      role: payload.role
    };
  } catch (error) {
    return null;
  }
};