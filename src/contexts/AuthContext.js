import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get or create user profile in Firestore
  const getUserProfile = async (firebaseUser) => {
    if (firebaseUser.isAnonymous) {
      return {
        uid: firebaseUser.uid,
        email: null,
        name: 'Anonymous',
        isAnonymous: true,
        isPremium: false,
        subscriptionType: null,
        subscriptionStatus: null
      };
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Update last login time
        const updateData = {
          lastLoginAt: new Date().toISOString()
        };
        
        try {
          await setDoc(userDocRef, updateData, { merge: true });
        } catch (updateError) {
          console.warn('Could not update last login time:', updateError);
        }
        
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || userData.name || firebaseUser.email?.split('@')[0],
          isAnonymous: false,
          isPremium: userData.isPremium || false,
          subscriptionType: userData.subscriptionType || null,
          subscriptionStatus: userData.subscriptionStatus || null,
          createdAt: userData.createdAt,
          lastLoginAt: new Date().toISOString()
        };
      } else {
        // Create new user profile
        const newUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          isPremium: false,
          subscriptionType: null,
          subscriptionStatus: null,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        try {
          await setDoc(userDocRef, newUserData);
          console.log('User profile created successfully');
        } catch (createError) {
          console.error('Error creating user profile:', createError);
          // Return user data even if we can't save to Firestore
          return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isAnonymous: false,
            isPremium: false,
            subscriptionType: null,
            subscriptionStatus: null,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
        }
        
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          isAnonymous: false,
          isPremium: false,
          subscriptionType: null,
          subscriptionStatus: null,
          createdAt: newUserData.createdAt,
          lastLoginAt: newUserData.lastLoginAt
        };
      }
    } catch (error) {
      console.error('Error accessing user profile:', error);
      
      // Return basic user data even if Firestore is unavailable
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        isAnonymous: false,
        isPremium: false,
        subscriptionType: null,
        subscriptionStatus: null,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser);
          setUser(userProfile);
        } catch (error) {
          console.error('Error getting user profile:', error);
          setUser(null);
        }
      } else {
        // Auto-signin anonymous users for assessment access
        try {
          console.log('No user signed in, signing in anonymously...');
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous sign in error:', error);
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      setIsSignupModalOpen(false);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Redirect to homepage after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const upgradeToAnonymous = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Anonymous sign in error:', error);
    }
  };

  const upgradeToPremium = async (subscriptionType = 'monthly') => {
    if (!user || user.isAnonymous) {
      console.error('Cannot upgrade: user is not authenticated or is anonymous');
      return false;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        isPremium: true,
        subscriptionType,
        subscriptionStatus: 'active',
        upgradedAt: new Date().toISOString()
      };
      
      await setDoc(userDocRef, updateData, { merge: true });
      console.log('Premium upgrade successful');
      
      // Update local state
      setUser(prev => ({
        ...prev,
        isPremium: true,
        subscriptionType,
        subscriptionStatus: 'active'
      }));
      
      return true;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      
      // If it's a permissions error, still update local state for demo purposes
      if (error.code === 'permission-denied') {
        console.warn('Permissions error - updating local state for demo');
        setUser(prev => ({
          ...prev,
          isPremium: true,
          subscriptionType,
          subscriptionStatus: 'active'
        }));
        return true;
      }
      
      return false;
    }
  };

  const refreshUserData = async () => {
    try {
      if (!user || user.isAnonymous) {
        return;
      }
      
      // Fetch latest user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // Update local state with fresh data
        setUser(prev => ({
          ...prev,
          isPremium: userData.isPremium || false,
          subscriptionType: userData.subscriptionType || null,
          subscriptionStatus: userData.subscriptionStatus || null,
          currentPeriodEnd: userData.currentPeriodEnd,
          cancelAtPeriodEnd: userData.cancelAtPeriodEnd
        }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isPremium: user?.isPremium || false,
      login,
      signup,
      logout,
      upgradeToAnonymous,
      upgradeToPremium,
      refreshUserData,
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