import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, CreditCard } from 'lucide-react';
import { PREMIUM_FEATURES, PREMIUM_CTA, PREMIUM_MESSAGING } from '../../config/premiumConfig';

const ProtectedRoute = ({ children, requiresPremium = false }) => {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bone py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chestnut"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to membership page
  if (!user) {
    return <Navigate to="/membership" replace />;
  }

  // If route requires premium but user is not premium, show upgrade page
  if (requiresPremium && !user.isPremium) {
    return (
      <div className="min-h-screen bg-bone py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CreditCard className="w-16 h-16 text-chestnut mx-auto mb-6" />
          <h1 className="font-serif font-bold text-4xl text-charcoal mb-6">
            {PREMIUM_MESSAGING.paywall.title}
          </h1>
          <p className="text-xl text-charcoal/80 mb-8">
            {PREMIUM_MESSAGING.paywall.description}
          </p>
          <div className="space-y-4">
            <button 
              className="bg-chestnut text-white px-8 py-4 rounded-lg font-medium hover:bg-chestnut/90 transition-colors"
              onClick={() => {
                // Handle upgrade
                window.location.href = '/membership';
              }}
            >
              {PREMIUM_CTA.secondary}
            </button>
            <div className="text-sm text-charcoal/70">
              <p>Premium includes:</p>
              <ul className="mt-2 space-y-1">
                {PREMIUM_FEATURES.core.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;