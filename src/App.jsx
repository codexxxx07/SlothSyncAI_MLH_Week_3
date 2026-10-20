import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AIStatusProvider } from './context/AIStatusContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Overview from './pages/Overview';
import ScanFolders from './pages/ScanFolders';
import OrganizationPlan from './pages/OrganizationPlan';
import Duplicates from './pages/Duplicates';
import ActivityHistory from './pages/ActivityHistory';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AIStatusProvider>
        <ToastProvider>
          <Router>
            <div className="flex h-screen overflow-hidden bg-canvas text-ink">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-ctl focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-pop"
              >
                Skip to content
              </a>
              <Sidebar />
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header />
                <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/scan" element={<ScanFolders />} />
                    <Route path="/plan" element={<OrganizationPlan />} />
                    <Route path="/duplicates" element={<Duplicates />} />
                    <Route path="/history" element={<ActivityHistory />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </ToastProvider>
      </AIStatusProvider>
    </ThemeProvider>
  );
}

export default App;
