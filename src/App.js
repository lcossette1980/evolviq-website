import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProjectsPage from './pages/ProjectsPage';
import BlogPage from './pages/BlogPage';
import MembersPage from './pages/MembersPage';
import MemberDashboard from './pages/MemberDashboard';
import AccountSettings from './pages/AccountSettings';
import AdminDashboard from './pages/AdminDashboard';
import LinearRegressionPage from './pages/LinearRegressionPage';
import EDAExplorePage from './pages/EDAExplorePageNew';
import ClassificationExplorePage from './pages/ClassificationExplorePageNew';
import ClusteringExplorePage from './pages/ClusteringExplorePage';
import NLPExplorePage from './pages/NLPExplorePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import ServiceIntake from './pages/ServiceIntake';
import AIImplementationPlaybook from './components/guides/ai-implementation-playbook.tsx';
import AIReadinessAssessment from './components/guides/ai-readiness-assessment.tsx';
import AIUseCaseROIToolkit from './components/guides/ai-use-case-roi-toolkit.tsx';
import AIStrategyStarterKit from './components/guides/ai-strategy-starter-kit.tsx';
import AIKnowledgeNavigator from './components/assessments/AIKnowledgeNavigator';
import ChangeReadinessAssessment from './components/assessments/ChangeReadinessAssessment';
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
      <ScrollToTop />
      <Navigation />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/membership" element={<MembersPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MemberDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tools/linear-regression" element={<LinearRegressionPage />} />
          <Route path="/tools/eda-explorer" element={<EDAExplorePage />} />
          <Route path="/tools/classification-explorer" element={<ClassificationExplorePage />} />
          <Route path="/tools/clustering-explorer" element={<ClusteringExplorePage />} />
          <Route path="/tools/nlp-explorer" element={<NLPExplorePage />} />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          
          {/* Service Intake */}
          <Route path="/service-intake" element={<ServiceIntake />} />
          
          {/* Assessment Tool Routes */}
          <Route 
            path="/tools/ai-knowledge-navigator" 
            element={
              <ProtectedRoute requiresPremium={false}>
                <AIKnowledgeNavigator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tools/change-readiness-assessment" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <ChangeReadinessAssessment />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Premium Guide Routes */}
          <Route 
            path="/guides/AIImplementationPlaybook" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <AIImplementationPlaybook />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guides/AIReadinessAssessment" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <AIReadinessAssessment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guides/AIUseCaseROIToolkit" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <AIUseCaseROIToolkit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guides/AIStrategyStarterKit" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <AIStrategyStarterKit />
              </ProtectedRoute>
            } 
          />
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
      <ProjectProvider>
        <Router>
          <AppContent />
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;