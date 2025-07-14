import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
          isAnonymous: firebaseUser.isAnonymous,
          isPremium: !firebaseUser.isAnonymous
        });
      } else {
        // Auto sign in anonymously for the regression tool
        signInAnonymously(auth).catch(console.error);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    // Simulate login - in real app, this would call Firebase auth
    setUser({ email, name: email.split('@')[0], isPremium: true, uid: 'simulated_' + Date.now() });
    setIsLoginModalOpen(false);
  };

  const signup = (email, password, name) => {
    // Simulate signup - in real app, this would call Firebase auth
    setUser({ email, name, isPremium: false, uid: 'simulated_' + Date.now() });
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
      isLoading,
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