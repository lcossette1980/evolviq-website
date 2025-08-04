import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorBoundary from '../common/ErrorBoundary';

const AuthModal = ({ isOpen, onClose, type, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const { setIsSignupModalOpen, setIsLoginModalOpen } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.email, formData.password, formData.name);
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif font-bold text-2xl text-charcoal">
            {type === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <button onClick={onClose} className="text-charcoal/60 hover:text-charcoal">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <ErrorBoundary level="component">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-charcoal mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-pearl rounded-lg px-4 py-3 focus:outline-none focus:border-chestnut"
              placeholder={type === 'login' ? 'Optional - for new users' : 'Your name'}
              required={type === 'signup'}
            />
          </div>
          <div>
            <label className="block text-charcoal mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-pearl rounded-lg px-4 py-3 focus:outline-none focus:border-chestnut"
              required
            />
          </div>
          <div>
            <label className="block text-charcoal mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-pearl rounded-lg px-4 py-3 focus:outline-none focus:border-chestnut"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-chestnut text-white py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors"
          >
            {type === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
        </ErrorBoundary>

        <div className="mt-4 text-center">
          <span className="text-charcoal/70 text-sm">
            {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              onClose();
              if (type === 'login') {
                setIsSignupModalOpen(true);
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            className="text-chestnut hover:text-chestnut/80 text-sm font-medium"
          >
            {type === 'login' ? 'Sign up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;