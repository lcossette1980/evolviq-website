// Subscription Management Component
// Handles viewing and managing user subscriptions

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import paymentAPI from '../../services/paymentAPI';

const SubscriptionManager = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.isAnonymous) {
      fetchSubscriptionStatus();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    try {
      setError('');
      const status = await paymentAPI.getSubscriptionStatus(user.uid);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setError('Failed to load subscription information. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSubscriptionStatus();
  };

  const handleManageSubscription = async () => {
    try {
      await paymentAPI.redirectToCustomerPortal(user.uid);
    } catch (error) {
      console.error('Error opening customer portal:', error);
      setError('Failed to open subscription management. Please try again.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'trialing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'past_due':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'canceled':
      case 'incomplete':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'trialing':
        return <Calendar className="w-5 h-5" />;
      case 'past_due':
      case 'incomplete':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Free Trial';
      case 'past_due':
        return 'Payment Due';
      case 'canceled':
        return 'Cancelled';
      case 'incomplete':
        return 'Incomplete';
      default:
        return 'No Subscription';
    }
  };

  const getPlanName = (planId) => {
    const plans = {
      monthly: 'Premium Monthly',
      annual: 'Premium Annual',
      business: 'Business'
    };
    return plans[planId] || 'Unknown Plan';
  };

  if (!user || user.isAnonymous) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Required
          </h3>
          <p className="text-gray-600">
            Please create an account to manage your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-chestnut mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription
            </h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {subscriptionStatus ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`border rounded-lg p-4 ${getStatusColor(subscriptionStatus.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(subscriptionStatus.status)}
                  <div className="ml-3">
                    <h3 className="font-semibold">
                      {getStatusText(subscriptionStatus.status)}
                    </h3>
                    {subscriptionStatus.has_subscription && (
                      <p className="text-sm opacity-80">
                        {getPlanName(subscriptionStatus.plan_id)}
                      </p>
                    )}
                  </div>
                </div>
                {subscriptionStatus.has_subscription && (
                  <div className="text-right">
                    <p className="font-semibold">
                      ${paymentAPI.getPlanDetails(subscriptionStatus.plan_id)?.price || 'N/A'}
                    </p>
                    <p className="text-sm opacity-80">
                      per {subscriptionStatus.plan_id === 'annual' ? 'year' : 'month'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Details */}
            {subscriptionStatus.has_subscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      {subscriptionStatus.status === 'trialing' ? 'Trial Ends' : 'Next Billing'}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(subscriptionStatus.current_period_end)}
                  </p>
                </div>

                {subscriptionStatus.trial_end && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-600">
                        Trial Period
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-blue-900">
                      Ends {formatDate(subscriptionStatus.trial_end)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Notice */}
            {subscriptionStatus.cancel_at_period_end && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-orange-900">
                      Subscription Cancelled
                    </h4>
                    <p className="text-sm text-orange-700">
                      Your subscription will end on {formatDate(subscriptionStatus.current_period_end)}. 
                      You'll continue to have access until then.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Management Actions */}
            {subscriptionStatus.has_subscription && (
              <div className="flex justify-center">
                <button
                  onClick={handleManageSubscription}
                  className="bg-chestnut text-white px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* No Subscription */
          <div className="text-center py-8">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Subscription
            </h3>
            <p className="text-gray-600 mb-6">
              Upgrade to Premium to access all features and assessments.
            </p>
            <button
              onClick={() => window.location.href = '/#premium'}
              className="bg-chestnut text-white px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors"
            >
              View Premium Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;