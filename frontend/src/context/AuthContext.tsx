import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isPasswordSet: boolean;
  setPasswordSet: (value: boolean) => void;
  checkPasswordStatus: () => Promise<void>;
  logout: () => void;
  token: string | null;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPasswordSet, setPasswordSet] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const checkPasswordStatus = async () => {
    try {
      // Check if user is a trial user
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      if (user.role !== 'trial') {
        setPasswordSet(true);
        return;
      }

      // Only check password status for trial users
      const response = await fetch('http://localhost:5000/api/users/password-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPasswordSet(data.isPasswordSet);
        
        // If trial user and password is not set and not on trial confirmation page
        if (!data.isPasswordSet && location.pathname !== '/trial-confirmation') {
          // Navigate to dashboard instead of trial confirmation
          navigate('/user/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking password status:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkPasswordStatus();
    }
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ 
      isPasswordSet, 
      setPasswordSet, 
      checkPasswordStatus,
      logout,
      token,
      user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
