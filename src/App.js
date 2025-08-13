import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import ErrorProvider from './contexts/ErrorContext';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageSuspense from './components/common/PageSuspense';
import './styles/globals.css';

// Eager load critical pages
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';

// Lazy load non-critical pages
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard.jsx'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

// Lazy load all interactive tools
const LinearRegressionPage = lazy(() => import('./pages/LinearRegressionPage'));
const EDAExplorePage = lazy(() => import('./pages/EDAExplorePage'));
const ClassificationExplorePage = lazy(() => import('./pages/ClassificationExplorePage'));
const ClusteringExplorePage = lazy(() => import('./pages/ClusteringExplorePage'));
const NLPExplorePage = lazy(() => import('./pages/NLPExplorePage'));
const GuideViewer = lazy(() => import('./pages/GuideViewer'));

// Lazy load legal pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));

// Lazy load other pages
const ServiceIntake = lazy(() => import('./pages/ServiceIntake'));
const WhyAINow = lazy(() => import('./pages/WhyAINow'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.jsx'));
const PaymentCancelled = lazy(() => import('./pages/PaymentCancelled.jsx'));

// Lazy load guides
const AIImplementationPlaybook = lazy(() => import('./components/guides/ai-implementation-playbook.tsx'));
const AIReadinessAssessment = lazy(() => import('./components/guides/ai-readiness-assessment.tsx'));
const AIUseCaseROIToolkit = lazy(() => import('./components/guides/ai-use-case-roi-toolkit.tsx'));
const AIStrategyStarterKit = lazy(() => import('./components/guides/ai-strategy-starter-kit.tsx'));

// Lazy load assessments
const AssessmentResultsView = lazy(() => import('./components/assessments/AssessmentResultsView.jsx'));

// New assessment components
const AIKnowledgeAssessment = lazy(() => import('./components/assessments/AIKnowledgeAssessment.jsx'));
const AIKnowledgeResults = lazy(() => import('./components/assessments/AIKnowledgeResults.jsx'));
const OrgReadinessAssessment = lazy(() => import('./components/assessments/OrgReadinessAssessment.jsx'));
const OrgReadinessResults = lazy(() => import('./components/assessments/OrgReadinessResults.jsx'));

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
          <Route path="/why-ai-now" element={<PageSuspense><WhyAINow /></PageSuspense>} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<PageSuspense><ProjectsPage /></PageSuspense>} />
          <Route path="/blog" element={<PageSuspense><BlogPage /></PageSuspense>} />
          <Route path="/membership" element={<PageSuspense><MembersPage /></PageSuspense>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PageSuspense>
                  <MemberDashboard />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <PageSuspense>
                  <AccountSettings />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<PageSuspense><AdminDashboard /></PageSuspense>} />
          <Route path="/tools/linear-regression" element={
            <ProtectedRoute requiresPremium={false}>
              <PageSuspense>
                <LinearRegressionPage />
              </PageSuspense>
            </ProtectedRoute>
          } />
          <Route path="/tools/eda-explorer" element={
            <ProtectedRoute requiresPremium={false}>
              <PageSuspense>
                <EDAExplorePage />
              </PageSuspense>
            </ProtectedRoute>
          } />
          <Route path="/tools/classification-explorer" element={
            <ProtectedRoute requiresPremium={true}>
              <PageSuspense>
                <ClassificationExplorePage />
              </PageSuspense>
            </ProtectedRoute>
          } />
          <Route path="/tools/clustering-explorer" element={
            <ProtectedRoute requiresPremium={true}>
              <PageSuspense>
                <ClusteringExplorePage />
              </PageSuspense>
            </ProtectedRoute>
          } />
          <Route path="/tools/nlp-explorer" element={
            <ProtectedRoute requiresPremium={false}>
              <PageSuspense>
                <NLPExplorePage />
              </PageSuspense>
            </ProtectedRoute>
          } />
          {/* Dynamic Guide Viewer (fallback for registry-driven paths) */}
          <Route path="/guides/:guideId" element={
            <ProtectedRoute requiresPremium={true}>
              <PageSuspense>
                <GuideViewer />
              </PageSuspense>
            </ProtectedRoute>
          } />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PageSuspense><PrivacyPolicy /></PageSuspense>} />
          <Route path="/terms-of-service" element={<PageSuspense><TermsOfService /></PageSuspense>} />
          <Route path="/cookie-policy" element={<PageSuspense><CookiePolicy /></PageSuspense>} />
          
          {/* Service Intake */}
          <Route path="/service-intake" element={<PageSuspense><ServiceIntake /></PageSuspense>} />
          
          {/* Payment Routes */}
          <Route path="/payment-success" element={<PageSuspense><PaymentSuccess /></PageSuspense>} />
          <Route path="/payment-cancelled" element={<PageSuspense><PaymentCancelled /></PageSuspense>} />
          
          {/* Assessment Tool Routes - Redirect old routes to new ones */}
          <Route 
            path="/tools/ai-knowledge-navigator" 
            element={<Navigate to="/dashboard/assessments/ai-knowledge" replace />}
          />
          <Route 
            path="/tools/change-readiness-assessment" 
            element={<Navigate to="/dashboard/assessments/org-readiness" replace />}
          />
          <Route 
            path="/assessment-results/:assessmentId" 
            element={
              <ProtectedRoute requiresPremium={false}>
                <PageSuspense>
                  <AssessmentResultsView />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />

          {/* New Assessment Routes */}
          <Route 
            path="/dashboard/assessments/ai-knowledge" 
            element={
              <ProtectedRoute requiresPremium={false}>
                <PageSuspense>
                  <AIKnowledgeAssessment />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/assessments/ai-knowledge/results" 
            element={
              <ProtectedRoute requiresPremium={false}>
                <PageSuspense>
                  <AIKnowledgeResults />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/assessments/org-readiness" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <PageSuspense>
                  <OrgReadinessAssessment />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/assessments/org-readiness/results" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <PageSuspense>
                  <OrgReadinessResults />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Premium Guide Routes */}
          <Route 
            path="/guides/AIImplementationPlaybook" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <PageSuspense>
                  <AIImplementationPlaybook />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guides/AIReadinessAssessment" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <PageSuspense>
                  <AIReadinessAssessment />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guides/AIUseCaseROIToolkit" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <PageSuspense>
                  <AIUseCaseROIToolkit />
                </PageSuspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guides/AIStrategyStarterKit" 
            element={
              <ProtectedRoute requiresPremium={true}>
                <PageSuspense>
                  <AIStrategyStarterKit />
                </PageSuspense>
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
    <ErrorBoundary level="page">
      <ErrorProvider>
        <AuthProvider>
          <ProjectProvider>
            <Router>
              <AppContent />
            </Router>
          </ProjectProvider>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
};

export default App;
