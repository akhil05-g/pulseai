import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import SplashScreen from './components/ui/SplashScreen';
import CustomCursor from './components/ui/CustomCursor';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerProfile from './pages/customers/CustomerProfile';
import OrderList from './pages/orders/OrderList';
import SegmentBuilder from './pages/segments/SegmentBuilder';
import AICommandCenter from './pages/ai/AICommandCenter';
import CampaignManager from './pages/campaigns/CampaignManager';
import CampaignPlanner from './pages/campaigns/CampaignPlanner';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import Analytics from './pages/analytics/Analytics';

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashDone} />}
      <CustomCursor />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="segments" element={<SegmentBuilder />} />
            <Route path="ai" element={<AICommandCenter />} />
            <Route path="campaigns" element={<CampaignManager />} />
            <Route path="campaigns/new" element={<CampaignPlanner />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
