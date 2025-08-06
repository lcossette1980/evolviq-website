// Payment API service for Stripe integration
import { buildUrl, createRequestConfig } from '../config/apiConfig';
import { auth } from '../services/firebase';

class PaymentAPI {
  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession(user, planId, successUrl, cancelUrl) {
    try {
      // Get Firebase auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const token = await currentUser.getIdToken();

      const requestData = {
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: user.email,
        metadata: {
          firebase_uid: user.uid,
          user_email: user.email
        }
      };

      const response = await fetch(
        buildUrl('/api/payments/create-checkout-session'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create checkout session');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId) {
    try {
      // Get Firebase auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const token = await currentUser.getIdToken();

      const response = await fetch(
        buildUrl('/api/payments/subscription-status'),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get subscription status');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }

  /**
   * Force sync subscription status from Stripe to Firebase
   */
  async syncSubscriptionStatus(userId) {
    try {
      // Get Firebase auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const token = await currentUser.getIdToken();

      const response = await fetch(
        buildUrl(`/api/payments/sync-subscription/${userId}`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to sync subscription status');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error syncing subscription status:', error);
      throw error;
    }
  }

  /**
   * Create customer portal session for subscription management
   */
  async createCustomerPortalSession(userId, returnUrl) {
    try {
      // Get Firebase auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const token = await currentUser.getIdToken();

      const requestData = {
        user_id: userId,
        return_url: returnUrl
      };

      const response = await fetch(
        buildUrl('/api/payments/create-portal-session'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create portal session');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(user, planId) {
    try {
      // Build URLs for success and cancel
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/payment-cancelled`;

      // Create checkout session
      const session = await this.createCheckoutSession(
        user,
        planId,
        successUrl,
        cancelUrl
      );

      // Redirect to Stripe Checkout
      window.location.href = session.checkout_url;

    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  /**
   * Redirect to customer portal for subscription management
   */
  async redirectToCustomerPortal(userId) {
    try {
      const returnUrl = window.location.origin + '/account';
      
      const portal = await this.createCustomerPortalSession(userId, returnUrl);
      
      // Redirect to customer portal
      window.location.href = portal.portal_url;

    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      throw error;
    }
  }

  /**
   * Get plan details for display
   */
  getPlanDetails(planId) {
    const plans = {
      monthly: {
        id: 'monthly',
        name: 'Premium Monthly',
        price: 47,
        interval: 'month',
        description: '3-day free trial, then $47/month',
        trial_days: 3
      },
      annual: {
        id: 'annual',
        name: 'Premium Annual',
        price: 470,
        interval: 'year',
        description: 'Save $94/year (2 months free)',
        savings: '$94',
        trial_days: 3
      },
      business: {
        id: 'business',
        name: 'Business',
        price: 147,
        interval: 'month',
        description: 'For growing teams',
        trial_days: 0
      }
    };

    return plans[planId] || null;
  }

  /**
   * Format price for display
   */
  formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId) {
    try {
      const status = await this.getSubscriptionStatus(userId);
      return status.has_subscription && ['active', 'trialing'].includes(status.status);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }


  /**
   * Handle payment success (called from success page)
   */
  handlePaymentSuccess(sessionId) {
    console.log('Payment successful for session:', sessionId);
    
    // You can add analytics tracking here
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: sessionId,
        value: 47, // This should be dynamic based on plan
        currency: 'USD'
      });
    }

    // Redirect to dashboard or success page
    return {
      success: true,
      message: 'Welcome to Premium! Your subscription is now active.',
      redirectUrl: '/member-dashboard'
    };
  }

  /**
   * Handle payment cancellation
   */
  handlePaymentCancellation() {
    console.log('Payment cancelled by user');
    
    return {
      success: false,
      message: 'Payment was cancelled. You can try again anytime.',
      redirectUrl: '/'
    };
  }
}

// Export singleton instance
const paymentAPI = new PaymentAPI();
export default paymentAPI;