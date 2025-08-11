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
import API_CONFIG, { buildUrl } from '../config/apiConfig';

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
        // No user signed in - don't auto-signin anonymous users
        // Users must explicitly sign up/login for access
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, name) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
      
      // Auto-create account if user doesn't exist
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.log('User not found, creating new account...');
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (name) {
            await updateProfile(userCredential.user, { displayName: name });
          }
          setIsLoginModalOpen(false);
          console.log('Account created successfully');
        } catch (signupError) {
          console.error('Auto-signup error:', signupError);
          throw signupError;
        }
      } else {
        throw error;
      }
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

  // 🚨 SECURITY FIX: Removed client-side premium upgrade bypass
  // Premium upgrades must go through proper payment flow
  const upgradeToPremium = async (subscriptionType = 'monthly') => {
    throw new Error('Premium upgrades must be processed through the payment system. Please use the proper checkout flow.');
  };

  // Proper payment flow initiation (replaces the security hole)
  const initiatePremiumUpgrade = async (planId) => {
    if (!user || user.isAnonymous) {
      throw new Error('Must be logged in to upgrade to premium');
    }

    try {
      // Create checkout session through secure backend
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(buildUrl('/api/payments/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          planId, 
          userId: user.uid,
          returnUrl: window.location.origin + '/payment-success',
          cancelUrl: window.location.origin + '/membership'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Failed to initiate premium upgrade:', error);
      throw error;
    }
  };

  // 🚨 SECURITY: Server-side premium verification (replaces client-side bypass)
  const verifyPremiumStatus = async () => {
    try {
      if (!user || user.isAnonymous) {
        return false;
      }

      // Get current Firebase auth user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return false;
      }

      const token = await currentUser.getIdToken();

      // Always use centralized API base URL
      const response = await fetch(buildUrl('/api/payments/subscription-status'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state with server-verified premium status
        setUser(prev => ({
          ...prev,
          isPremium: data.has_subscription && data.subscription_status === 'active',
          subscriptionType: data.plan_name || null,
          subscriptionStatus: data.subscription_status || 'none',
          subscriptionExpiresAt: data.current_period_end,
          premiumVerifiedAt: new Date().toISOString()
        }));
        
        return data.has_subscription && data.subscription_status === 'active';
      }
      
      return false;
    } catch (error) {
      console.error('Premium status verification failed:', error);
      return false;
    }
  };

  // 🚨 SECURITY: Verify premium access before accessing protected features
  const verifyPremiumAccess = async () => {
    try {
      if (!user || user.isAnonymous) {
        throw new Error('Authentication required');
      }

      // For now, check premium status from user object
      // TODO: Implement proper server-side verification
      if (user.isPremium || user.subscriptionStatus === 'active') {
        return { 
          isPremium: true, 
          subscriptionType: user.subscriptionType,
          subscriptionStatus: user.subscriptionStatus 
        };
      }

      throw new Error('Premium subscription required');
    } catch (error) {
      console.error('Premium access verification failed:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      if (!user || user.isAnonymous) {
        return;
      }
      
      // First verify premium status from Stripe
      await verifyPremiumStatus();
      
      // Then reload user data from Firestore to get the updated values
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userProfile = await getUserProfile(currentUser);
        setUser(userProfile);
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
      upgradeToPremium, // Now throws error - forces proper payment flow
      initiatePremiumUpgrade, // New secure payment initiation
      verifyPremiumStatus, // 🚨 SECURITY: Server-side premium verification
      verifyPremiumAccess, // 🚨 SECURITY: Verify access before premium features
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
