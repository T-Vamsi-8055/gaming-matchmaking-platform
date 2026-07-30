import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_PORT } from '../utils/constants';

export const useAuth = (redirectTo = '/auth') => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`http://localhost:${API_PORT}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (redirectTo) navigate(redirectTo);
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Auth check failed:", error);
        if (redirectTo) navigate(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo]);

  return { user, loading, setUser };
};

export default useAuth;
