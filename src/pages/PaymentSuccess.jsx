// Payment Success Page
// Handles successful Stripe checkout redirects

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Crown, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import paymentAPI from '../services/paymentAPI';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Handle payment success
      const result = paymentAPI.handlePaymentSuccess(sessionId);
      
      // Fetch updated subscription status and force sync
      if (user && !user.isAnonymous) {
        syncAndFetchSubscriptionStatus();
      } else {
        setIsLoading(false);
      }
    } else {
      // No session ID, redirect to home
      navigate('/');
    }
  }, [sessionId, user, navigate]);

  const syncAndFetchSubscriptionStatus = async () => {
    try {
      // First, force sync from Stripe to Firebase
      await paymentAPI.syncSubscriptionStatus(user.uid);
      
      // Refresh user data in AuthContext
      await refreshUserData();
      
      // Then fetch the updated status
      const status = await paymentAPI.getSubscriptionStatus(user.uid);
      setSubscriptionInfo(status);
    } catch (error) {
      console.error('Error syncing/fetching subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const status = await paymentAPI.getSubscriptionStatus(user.uid);
      setSubscriptionInfo(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/member-dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-chestnut mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Premium!
        </h1>
        <p className="text-gray-600 mb-8">
          Your subscription has been activated successfully.
        </p>

        {/* Subscription Details */}
        {subscriptionInfo && subscriptionInfo.has_subscription && (
          <div className="bg-gradient-to-r from-chestnut to-chestnut/80 text-white rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 mr-2" />
              <h2 className="text-xl font-semibold">
                {subscriptionInfo.plan_id === 'monthly' ? 'Premium Monthly' : 
                 subscriptionInfo.plan_id === 'annual' ? 'Premium Annual' : 
                 'Business Plan'}
              </h2>
            </div>
            
            {subscriptionInfo.status === 'trialing' && subscriptionInfo.trial_end && (
              <div className="flex items-center justify-center text-white/90">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  3-day free trial ends {new Date(subscriptionInfo.trial_end).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Benefits */}
        <div className="text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            What you now have access to:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              All intelligent AI assessments with multi-agent analysis
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Unlimited access to interactive ML tools
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Complete implementation guides and playbooks
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Priority email support
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              Export all your data and insights
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-chestnut text-white py-3 px-6 rounded-lg font-medium hover:bg-chestnut/90 transition-colors flex items-center justify-center"
          >
            <span>Start Exploring Premium</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/account')}
            className="w-full text-chestnut border border-chestnut py-3 px-6 rounded-lg font-medium hover:bg-chestnut hover:text-white transition-colors"
          >
            Manage Subscription
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-500 mb-2">
            Need help getting started?
          </p>
          <a 
            href="mailto:support@evolviq.com" 
            className="text-chestnut text-sm font-medium hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;