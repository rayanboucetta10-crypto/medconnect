import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authAPI.me();
      setUser(data.user);
      setProfile(data.profile || null);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setProfile(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setUser(data.user);
    setProfile(data.profile || null);
    setToken(data.token);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    setUser(data.user);
    setProfile(data.profile || null);
    setToken(data.token);
    return data;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, token,
      login, register, logout,
      updateUser, updateProfile,
      isAuthenticated: !!user,
      isDoctor: user?.role === 'doctor',
      isPatient: user?.role === 'patient',
      refetch: fetchMe,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
