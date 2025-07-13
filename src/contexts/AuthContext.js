import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const login = (email, password) => {
    // Simulate login - in real app, this would call your API
    setUser({ email, name: email.split('@')[0], isPremium: true });
    setIsLoginModalOpen(false);
  };

  const signup = (email, password, name) => {
    // Simulate signup - in real app, this would call your API
    setUser({ email, name, isPremium: false });
    setIsSignupModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoginModalOpen,
      setIsLoginModalOpen,
      isSignupModalOpen,
      setIsSignupModalOpen
    }}>
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