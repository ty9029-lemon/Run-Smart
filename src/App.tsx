import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import DesignSystem from './pages/DesignSystem';
import History from './pages/History';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import { useProfileStore } from './store/profileStore';

/** 온보딩을 마치지 않았으면 온보딩으로 보낸다. */
function RequireOnboarding() {
  const hasOnboarded = useProfileStore((s) => s.hasOnboarded);
  return hasOnboarded ? <Outlet /> : <Navigate to="/onboarding" replace />;
}

/** 이미 온보딩을 마쳤다면 홈으로 보낸다. */
function OnboardingOnly() {
  const hasOnboarded = useProfileStore((s) => s.hasOnboarded);
  return hasOnboarded ? <Navigate to="/" replace /> : <Onboarding />;
}

/** 앱 라우팅: 온보딩 / 홈 / 설정 / 히스토리 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/onboarding" element={<OnboardingOnly />} />
        <Route element={<RequireOnboarding />}>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
