import React, { useState } from 'react';
import { 
  User, 
  Building, 
  CheckCircle,
  Send,
  AlertCircle
} from 'lucide-react';
import { validateServiceIntakeForm } from '../utils/inputValidation';
import { useError } from '../contexts/ErrorContext';
import { LoadingButton } from '../components/common/LoadingSpinner';
import { useRateLimit, rateLimitedFetch, getRateLimitMessage } from '../utils/rateLimiting';

const ServiceIntake = () => {
  const { showSuccess, showError, handleError } = useError();
  const { checkRateLimit } = useRateLimit('forms', 'service-intake');
  const [formData, setFormData] = useState({
    // Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Organization Information
    organizationName: '',
    organizationType: '',
    industry: '',
    organizationSize: '',
    website: '',
    
    // Project Information
    servicesInterested: [],
    projectDescription: '',
    currentChallenges: '',
    budgetRange: '',
    timeline: '',
    previousAIExperience: '',
    
    // Additional Information
    howDidYouHear: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const colors = {
    charcoal: '#2A2A2A',
    chestnut: '#A44A3F',
    khaki: '#A59E8C',
    pearl: '#D7CEB2',
    bone: '#F5F2EA'
  };

  const services = [
    { id: 'quick-assessment', name: 'Quick AI Assessment (Free)' },
    { id: 'half-day-strategy', name: 'Half-Day Strategy Session' },
    { id: 'ai-basics-training', name: 'AI Basics Training Workshop' },
    { id: 'change-readiness', name: 'Change Readiness Workshop' },
    { id: 'genai-workshops', name: 'GenAI Workshops' },
    { id: 'pilot-support', name: 'Pilot Project Support' },
    { id: 'governance-setup', name: 'Simple Governance Setup' },
    { id: 'website-development', name: 'Website Design & Development' },
    { id: 'custom-consulting', name: 'Custom Consulting Services' }
  ];

  const organizationTypes = [
    { value: 'small_business', label: 'Small Business' },
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'healthcare', label: 'Healthcare Organization' },
    { value: 'education', label: 'Educational Institution' },
    { value: 'government', label: 'Government Agency' },
    { value: 'other', label: 'Other' }
  ];

  const organizationSizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-25', label: '11-25 employees' },
    { value: '26-50', label: '26-50 employees' },
    { value: '51-100', label: '51-100 employees' },
    { value: '101-250', label: '101-250 employees' },
    { value: '250+', label: '250+ employees' }
  ];

  const budgetRanges = [
    { value: 'under_5k', label: 'Under $5,000' },
    { value: '5k_15k', label: '$5,000 - $15,000' },
    { value: '15k_50k', label: '$15,000 - $50,000' },
    { value: '50k_100k', label: '$50,000 - $100,000' },
    { value: '100k+', label: '$100,000+' },
    { value: 'not_sure', label: 'Not sure yet' }
  ];

  const timelines = [
    { value: 'asap', label: 'As soon as possible' },
    { value: '1_month', label: 'Within 1 month' },
    { value: '3_months', label: 'Within 3 months' },
    { value: '6_months', label: 'Within 6 months' },
    { value: '12_months', label: 'Within 12 months' },
    { value: 'exploring', label: 'Just exploring options' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      servicesInterested: prev.servicesInterested.includes(serviceId)
        ? prev.servicesInterested.filter(id => id !== serviceId)
        : [...prev.servicesInterested, serviceId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});
    setShowErrors(false);

    try {
      // 🚨 RATE LIMITING: Check client-side rate limit first
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        showError(getRateLimitMessage({ 
          code: 'CLIENT_RATE_LIMITED', 
          retryAfter: rateLimitCheck.retryAfter,
          message: rateLimitCheck.message 
        }), {
          category: 'rate_limit',
          duration: 0,
          actions: [
            {
              label: 'Contact Us Directly',
              action: () => window.open('mailto:lorentcossette@gmail.com', '_blank')
            }
          ]
        });
        return;
      }

      // 🚨 SECURITY: Validate and sanitize all form inputs
      const validatedData = validateServiceIntakeForm(formData);
      
      console.log('✅ Form validation passed');

      // Submit with rate limiting
      const { response } = await rateLimitedFetch('/api/forms/service-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData)
      }, {
        action: 'forms',
        identifier: 'service-intake'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Submission failed');
      }

      const result = await response.json();
      console.log('✅ Service intake form successfully submitted:', result);
      
      // Show success notification
      showSuccess('Your service inquiry has been submitted successfully! We\'ll be in touch within 24 hours.', {
        duration: 5000
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('❌ Error submitting service intake form:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError' && error.errors) {
        setValidationErrors(error.errors);
        setShowErrors(true);
        
        // Show validation error notification
        showError('Please correct the form errors and try again.', {
          category: 'validation',
          duration: 0, // Persistent until form is fixed
          actions: [
            {
              label: 'Scroll to Errors',
              action: () => {
                const firstErrorField = Object.keys(error.errors)[0];
                const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                if (errorElement) {
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  errorElement.focus();
                }
              }
            }
          ]
        });
      } else if (error.code === 'CLIENT_RATE_LIMITED' || error.code === 'SERVER_RATE_LIMITED') {
        // Handle rate limiting errors
        showError(getRateLimitMessage(error), {
          category: 'rate_limit',
          duration: 0,
          actions: [
            {
              label: 'Contact Us Directly',
              action: () => window.open('mailto:lorentcossette@gmail.com', '_blank')
            }
          ]
        });
      } else {
        // Use centralized error handling for network/server errors
        handleError(error, {
          retryAction: () => {
            // Clear any previous errors and retry
            setValidationErrors({});
            setShowErrors(false);
            handleSubmit({ preventDefault: () => {} });
          },
          details: 'Service intake form submission failed'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bone }}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: colors.chestnut }} />
            <h1 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal }}>
              Thank You for Your Interest!
            </h1>
            <p className="text-lg mb-6" style={{ color: colors.khaki }}>
              We've received your service inquiry and will be in touch within 24 hours.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2" style={{ color: colors.charcoal }}>What happens next?</h3>
              <ul className="text-left space-y-2 text-sm" style={{ color: colors.charcoal }}>
                <li>• We'll review your requirements and prepare a customized proposal</li>
                <li>• You'll receive a follow-up email with next steps within 24 hours</li>
                <li>• We'll schedule a brief discovery call to discuss your specific needs</li>
                <li>• If there's a good fit, we'll provide detailed project timeline and pricing</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: colors.chestnut }}
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bone }}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: colors.charcoal }}>
            Service Inquiry
          </h1>
          <p className="text-xl" style={{ color: colors.khaki }}>
            Tell us about your organization and AI goals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Validation Error Summary */}
          {showErrors && Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Please correct the following errors:
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: colors.charcoal }}>
              <User className="w-5 h-5 mr-2" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${validationErrors.firstName ? 'text-red-700' : ''}`} style={{ color: validationErrors.firstName ? '#dc2626' : colors.charcoal }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                    validationErrors.firstName 
                      ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-chestnut'
                  }`}
                />
                {validationErrors.firstName && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.firstName}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Organization Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: colors.charcoal }}>
              <Building className="w-5 h-5 mr-2" />
              Organization Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Organization Type *
                </label>
                <select
                  name="organizationType"
                  required
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                >
                  <option value="">Select type</option>
                  {organizationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g., Healthcare, Finance, Retail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Organization Size *
                </label>
                <select
                  name="organizationSize"
                  required
                  value={formData.organizationSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                >
                  <option value="">Select size</option>
                  {organizationSizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Services of Interest */}
          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.charcoal }}>
              Services of Interest *
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map(service => (
                <label key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.servicesInterested.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="text-chestnut focus:ring-chestnut"
                  />
                  <span className="text-sm">{service.name}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Project Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.charcoal }}>
              Project Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Project Description
                </label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Briefly describe what you're hoping to achieve with AI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Current Challenges
                </label>
                <textarea
                  name="currentChallenges"
                  value={formData.currentChallenges}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="What specific challenges or pain points are you looking to address?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                    Budget Range
                  </label>
                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map(budget => (
                      <option key={budget.value} value={budget.value}>{budget.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    {timelines.map(timeline => (
                      <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Previous AI Experience
                </label>
                <textarea
                  name="previousAIExperience"
                  value={formData.previousAIExperience}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Tell us about any previous experience with AI or automation tools"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Additional Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.charcoal }}>
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  How did you hear about us?
                </label>
                <input
                  type="text"
                  name="howDidYouHear"
                  value={formData.howDidYouHear}
                  onChange={handleInputChange}
                  placeholder="e.g., Google search, referral, social media"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any other information you'd like us to know?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="text-center pt-6">
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Submitting your inquiry..."
              disabled={formData.servicesInterested.length === 0}
              className="px-8 py-3 rounded-lg text-white font-medium transition-colors mx-auto"
              style={{ backgroundColor: colors.chestnut }}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Service Inquiry
            </LoadingButton>
            <p className="text-sm text-gray-500 mt-2">
              We'll respond within 24 hours with next steps
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceIntake;