import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProjectsPage from './pages/ProjectsPage';
import BlogPage from './pages/BlogPage';
import MembersPage from './pages/MembersPage';
import LinearRegressionPage from './pages/LinearRegressionPage';
import './styles/globals.css';

const AppContent = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    isSignupModalOpen, 
    setIsSignupModalOpen, 
    login, 
    signup 
  } = useAuth();

  return (
    <div className="min-h-screen bg-bone font-sans">
      <Navigation />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/tools/linear-regression" element={<LinearRegressionPage />} />
        </Routes>
      </main>

      <Footer />

      {/* Auth Modals */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        type="login"
        onSubmit={login}
      />
      <AuthModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        type="signup"
        onSubmit={signup}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;