import { useEffect } from 'react';
import { useUser } from './context/UserContext';
import { router } from 'expo-router';
import DashboardScreen from "./dashboard";
import LoginScreen from "./login";

export default function Index() {
  const { isAuthenticated, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return null;
  }

  return isAuthenticated ? <DashboardScreen /> : <LoginScreen />;
}