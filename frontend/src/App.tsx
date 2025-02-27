import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard.tsx';
import Profile from './components/Profile';
import QuizPage from './components/QuizPage';
import SubscriptionPage from './components/SubscriptionPage';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateAdmin from './admin/pages/CreateAdmin';
import ViewAdmins from './admin/pages/ManageUsers/ViewAdmins';
import UploadQuestions from './admin/pages/UploadQuestions';
import CreateTopic from './admin/pages/CreateTopic';
import ManageQuestions from './admin/pages/ManageQuestions';
import ManageGrades from './admin/pages/ManageGrades';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ManageUsers from './admin/pages/ManageUsers';
import CreateGrade from './admin/pages/CreateGrade';
import ManageSubjects from './admin/pages/ManageSubjects';
import CreateSubject from './admin/pages/CreateSubject';
import ManageTopics from './admin/pages/ManageTopics';
import ContactPage from './components/ContactPage';
import MathsPage from './components/subjects/MathsPage';
import EnglishPage from './components/subjects/EnglishPage';
import SciencePage from './components/subjects/SciencePage';
import EditTopic from './admin/pages/EditTopic';
import EditQuestion from './admin/pages/EditQuestion';
import EditAdmin from './admin/pages/EditAdmin';
import ManagePlans from './admin/pages/subscriptions/ManagePlans';
import ManageSubscribers from './admin/pages/subscriptions/ManageSubscribers';
import WebsiteSettings from './admin/pages/settings/WebsiteSettings';
import AccountSettings from './admin/pages/settings/AccountSettings';
import TopicListingPage from './components/subjects/TopicListingPage';
import TopicQuizPage from './components/quiz/TopicQuizPage';
import TopicsList from './components/subjects/TopicsList';
import MathsTopicList from './components/subjects/MathsTopicList';
import SectionListingPage from './components/sections/SectionListingPage';
import ManageSections from './admin/pages/ManageSections';
import CreateSection from './admin/pages/CreateSection';
import ForSchools from './pages/ForSchools';
import SchoolRequests from './admin/pages/SchoolRequests';
import PlanDetail from './pages/PlanDetail';
import Terms from './pages/Terms';
import TrialConfirmation from './pages/TrialConfirmation';
import Settings from './pages/Settings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const adminToken = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [adminToken, navigate]);

  return adminToken ? <>{children}</> : null;
};

// Create a wrapper component that will use the navigation hooks
const AppContent = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { isPasswordSet, checkPasswordStatus } = useAuth();

  // Check auth status on mount and token changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (token) {
        checkPasswordStatus();
      }
    };

    checkAuth();
    // Listen for storage events (in case token is changed in another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [checkPasswordStatus]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Function to check if route should be protected
  const shouldProtectRoute = (pathname: string) => {
    const publicRoutes = ['/login', '/', '/about', '/contact'];
    return !publicRoutes.includes(pathname);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!(location.pathname.startsWith('/user/') || location.pathname.startsWith('/admin')) && (
        <Navbar isAuthenticated={isAuthenticated} logout={handleLogout} />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/trial-confirmation" element={<TrialConfirmation />} />
        {/* User Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard logout={handleLogout} /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/plan-detail" element={<PlanDetail />} />
        <Route path="/for-schools" element={<ForSchools />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedAdminRoute>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users/manage-users" element={<ManageUsers userType="user" />} />
              <Route path="users/manage-admins" element={<ManageUsers userType="admin" />} />
              <Route path="questions" element={<ManageQuestions />} />
              <Route path="grades" element={<ManageGrades />} />
              <Route path="grades/create" element={<CreateGrade />} />
              <Route path="questions/upload" element={<UploadQuestions />} />
              <Route path="subjects" element={<ManageSubjects />} />
              <Route path="subjects/create" element={<CreateSubject />} />
              <Route path="topics" element={<ManageTopics />} />
              <Route path="topics/create" element={<CreateTopic />} />
              <Route path="topics/edit/:id" element={<EditTopic />} />
              <Route path="sections" element={<ManageSections />} />
              <Route path="sections/create" element={<CreateSection />} />
              <Route path="questions/edit/:id" element={<EditQuestion />} />
              <Route path="school-requests" element={<SchoolRequests />} />
              <Route path="settings/website" element={<WebsiteSettings />} />
              <Route path="settings/account" element={<AccountSettings />} />
              <Route path="subscriptions/plans" element={<ManagePlans />} />
              <Route path="subscriptions/subscribers" element={<ManageSubscribers />} />
            </Routes>
          </ProtectedAdminRoute>
        } />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/user/learning/maths" element={
          <ProtectedRoute>
            <MathsPage logout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/user/learning/english" element={
          <ProtectedRoute>
            <EnglishPage logout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/user/learning/science" element={
          <ProtectedRoute>
            <SciencePage logout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/create-admin" element={
          <AdminProtectedRoute>
            <CreateAdmin />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users/edit-admin/:id" element={
          <AdminProtectedRoute>
            <EditAdmin />
          </AdminProtectedRoute>
        } />
        <Route 
          path="/topics" 
          element={
            <ProtectedRoute>
              <TopicListingPage logout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/topic/:topicId" 
          element={
            <ProtectedRoute>
              <TopicQuizPage logout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/learning/:subject/year/:yearId/topics" 
          element={
            <ProtectedRoute>
              <TopicsList logout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/topic/:topicId/sections" 
          element={
            <ProtectedRoute>
              <SectionListingPage logout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:topicId/section/:sectionId" 
          element={
            <ProtectedRoute>
              <TopicQuizPage logout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route path="/user/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        {/* Catch-all route to redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;