// Payment Cancelled Page
// Handles cancelled Stripe checkout redirects

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard, Mail } from 'lucide-react';
import paymentAPI from '../services/paymentAPI';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle payment cancellation
    paymentAPI.handlePaymentCancellation();
  }, []);

  const handleRetry = () => {
    navigate('/#premium');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Cancelled Icon */}
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-orange-500" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          No worries! Your payment was cancelled and no charges were made to your account.
        </p>

        {/* Why Subscribe Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            Why upgrade to Premium?
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <CreditCard className="w-4 h-4 text-chestnut mr-3 flex-shrink-0" />
              3-day free trial • Cancel anytime
            </li>
            <li className="flex items-center">
              <CreditCard className="w-4 h-4 text-chestnut mr-3 flex-shrink-0" />
              AI-powered assessments with expert analysis
            </li>
            <li className="flex items-center">
              <CreditCard className="w-4 h-4 text-chestnut mr-3 flex-shrink-0" />
              Interactive tools to test AI for your business
            </li>
            <li className="flex items-center">
              <CreditCard className="w-4 h-4 text-chestnut mr-3 flex-shrink-0" />
              Complete implementation guides
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-chestnut text-white py-3 px-6 rounded-lg font-medium hover:bg-chestnut/90 transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            <span>Try Again - Start Free Trial</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full text-gray-600 border border-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Homepage</span>
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-2">
            Need help deciding?
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Have questions about Premium features or pricing? We're here to help!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="mailto:support@evolviq.com" 
              className="flex items-center justify-center text-chestnut text-sm font-medium hover:underline"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email Support
            </a>
            <span className="hidden sm:block text-gray-300">•</span>
            <button
              onClick={() => navigate('/faq')}
              className="text-chestnut text-sm font-medium hover:underline"
            >
              View FAQ
            </button>
          </div>
        </div>

        {/* Testimonial or Social Proof */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 italic">
            "EvolvIQ helped us identify exactly where AI could make the biggest impact in our business. 
            The assessments are incredibly detailed and actionable."
          </p>
          <p className="text-xs text-blue-600 mt-2 font-medium">
            — Sarah M., Small Business Owner
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;