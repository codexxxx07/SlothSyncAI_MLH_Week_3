import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
    <Router>
      <div className="flex h-screen bg-warm-white dark:bg-dark-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
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
  );
}

export default App;
