import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Sun, Crown, User, LogOut } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import HomeVersion from './pages/HomeVersion';
import ProVersion from './pages/ProVersion';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';

function NavigationButton({ isPro, onProToggle }: { isPro: boolean; onProToggle: () => void }) {
  const { user, isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isPro}
            onChange={onProToggle}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-2 text-sm font-medium text-gray-900 flex items-center">
            Pro
            <Crown className="h-4 w-4 ml-1 text-blue-600" />
          </span>
        </label>
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-700 hover:text-gray-900"
        >
          <User className="h-5 w-5 mr-1" />
          Dashboard
        </Link>
        <SignOutButton>
          <button
          className="inline-flex items-center text-gray-700 hover:text-gray-900"
          >
          <LogOut className="h-5 w-5 mr-1" />
          Sign Out
          </button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <Link
      to="/login"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <User className="h-5 w-5 mr-1" />
      Sign In
    </Link>
  );
}

function Logo({ isPro }: { isPro: boolean }) {
  return (
    <Link to="/" className="flex items-center">
      <Sun className="h-8 w-8 text-yellow-500" />
      <span className="ml-2 text-xl font-bold text-gray-900">SolarAppointments</span>
      {isPro && (
        <div className="ml-2 inline-flex items-center">
          <Crown className="h-5 w-5 text-blue-600" />
          <span className="ml-1 text-sm font-medium text-blue-600">Pro</span>
        </div>
      )}
    </Link>
  );
}

function App() {
  const { user, isSignedIn } = useUser();
  const [isPro, setIsPro] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Logo isPro={isPro} />
              <NavigationButton isPro={isPro} onProToggle={() => setIsPro(!isPro)} />
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={isPro ? <ProVersion /> : <HomeVersion />} />
          <Route
            path="/login"
            element={isSignedIn ? <Navigate to="/dashboard" replace /> : <Auth />}
          />
          <Route
            path="/dashboard"
            element={isSignedIn ? <UserDashboard user={user} /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;