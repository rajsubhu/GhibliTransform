import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { apiRequest } from './queryClient';
import { queryClient } from './queryClient';

export type AuthUser = {
  id: string;
  email: string;
  credits: number;
  instagram_username?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, instagram_username?: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyInstagram: (instagram_username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Initialize: check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing token in local storage
        const savedToken = localStorage.getItem('authToken');
        
        if (savedToken) {
          setToken(savedToken);
          
          // Fetch user data with the token
          const response = await fetch('/api/user/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token might be invalid, clear it
            localStorage.removeItem('authToken');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authToken');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // apiRequest now returns JSON data directly
      const data = await apiRequest('POST', '/api/auth/login', { email, password });
      
      // Save token and user data
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
      
      // Invalidate any queries that might depend on auth state
      queryClient.invalidateQueries();
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, instagram_username?: string) => {
    try {
      setLoading(true);
      
      // apiRequest now returns JSON data directly
      await apiRequest('POST', '/api/auth/register', { 
        email, 
        password,
        instagram_username
      });
      
      // Auto-login after successful registration
      await login(email, password);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear token from storage
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Invalidate any queries that might depend on auth state
      queryClient.invalidateQueries();
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyInstagram = async (instagram_username: string) => {
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Use apiRequest which handles token automatically
      const data = await apiRequest('POST', '/api/user/verify-instagram', { instagram_username });
      
      // Update user with new credits
      setUser(prev => prev ? { ...prev, credits: data.credits } : null);
      
    } catch (error) {
      console.error('Instagram verification error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        verifyInstagram,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};