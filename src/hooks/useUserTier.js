import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserTierConfig, 
  hasFeatureAccess, 
  getFeatureLimits,
  needsUpgrade,
  getUpgradeMessage 
} from '../config/tierConfig';

/**
 * Hook for managing user tier and feature access
 */
export const useUserTier = () => {
  const { user } = useAuth();
  const [tierConfig, setTierConfig] = useState(null);
  
  useEffect(() => {
    const config = getUserTierConfig(user);
    setTierConfig(config);
  }, [user]);
  
  const tier = useMemo(() => {
    if (!user || user.isAnonymous) return 'free';
    if (user.isPremium) {
      return user.subscriptionStatus === 'trialing' ? 'trial' : 'premium';
    }
    return 'free';
  }, [user]);
  
  const canAccess = (feature, subFeature = null) => {
    return hasFeatureAccess(user, feature, subFeature);
  };
  
  const getLimits = (feature) => {
    return getFeatureLimits(user, feature);
  };
  
  const requiresUpgrade = (feature, subFeature = null) => {
    return needsUpgrade(user, feature, subFeature);
  };
  
  const upgradeMessage = (feature, subFeature = null) => {
    return getUpgradeMessage(feature, subFeature);
  };
  
  const isFreeTier = tier === 'free';
  const isTrialTier = tier === 'trial';
  const isPremiumTier = tier === 'premium';
  
  return {
    tier,
    tierConfig,
    canAccess,
    getLimits,
    requiresUpgrade,
    upgradeMessage,
    isFreeTier,
    isTrialTier,
    isPremiumTier
  };
};