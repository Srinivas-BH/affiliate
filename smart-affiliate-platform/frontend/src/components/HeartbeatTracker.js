import { useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function HeartbeatTracker() {
  const { isLoggedIn, token } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    // Ping every 3 minutes
    const interval = setInterval(() => {
      api.post('/auth/heartbeat').catch(() => {});
    }, 3 * 60 * 1000); 

    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

  return null;
}