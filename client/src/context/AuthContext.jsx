import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, householdApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        fetchHousehold();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const fetchHousehold = useCallback(async () => {
    try {
      const res = await householdApi.get();
      setHousehold(res.data);
    } catch {
      // household fetch can fail quietly on startup
    }
  }, []);

  const login = async (name, pin, householdId) => {
    const res = await authApi.login({ name, pin, householdId });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    await fetchHousehold();
    return userData;
  };

  const register = async (householdName, parentName, pin) => {
    const res = await authApi.register({
      householdName,
      name: parentName,
      pin,
    });
    const { token, user: userData, household: hh } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setHousehold(hh);
    return { user: userData, household: hh };
  };

  const joinHousehold = async (joinCode, name, pin) => {
    const res = await authApi.join({ joinCode, name, pin });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    await fetchHousehold();
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setHousehold(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isParent = user?.role === 'parent';
  const isKid = user?.role === 'kid';

  return (
    <AuthContext.Provider
      value={{
        user,
        household,
        loading,
        isParent,
        isKid,
        login,
        register,
        joinHousehold,
        logout,
        updateUser,
        fetchHousehold,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
