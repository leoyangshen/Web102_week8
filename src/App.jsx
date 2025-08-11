import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Auth from './Auth';
import CrewmateList from './pages/CrewmateList';
import CreateCrewmate from './pages/CreateCrewmate';
import CrewmateDetail from './pages/CrewmateDetail';
import EditCrewmate from './pages/EditCrewmate';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then( ({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange( (_event, session) => {
      setSession(session);
      setLoadingSession(false);
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loadingSession) {
    return <div className="loading-full-page">Loading application...</div>;
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="app-title-link">
            <h1>Crew Builder</h1>
          </Link>
          <nav className="main-nav">
            {session ? (
              <>
                <Link to="/create" className="nav-link">Add Crewmate</Link>
                <button onClick={() => supabase.auth.signOut()} className="sign-out-btn"> Sign Out ({session.user?.email})
                </button>
              </>
            ) : (
              <span className="nav-text">Please sign in</span>
            )}
          </nav>
        </header>

        <main className="app-main-content">
          <Routes>
            <Route path="/" element={session ? <CrewmateList session={session} /> : <Auth />} />
            <Route
              path="/create"
              element={session ? <CreateCrewmate session={session} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/crewmate/:id"
              element={session ? <CrewmateDetail session={session} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/edit/:id"
              element={session ? <EditCrewmate session={session} /> : <Navigate to="/" replace />}
            />
            {/* Fallback route for unmatched paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 Crew Builder. Powered by Supabase & React.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

/*
  Explanation:
  - This is the main application component, now wrapped with `BrowserRouter` for routing.
  - `useState` and `useEffect` manage the Supabase user session and loading state.
  - The `header` includes navigation links and a sign-out button, conditionally rendered based on session.
  - `Routes` define the different paths in your application:
    - `/`: The home page, showing either the `Auth` component (if not logged in) or `CrewmateList` (if logged in).
    - `/create`: The form to create a new crewmate. Users are redirected to `/` if not logged in.
    - `/crewmate/:id`: The detail page for a specific crewmate, using a URL parameter for the ID.
    - `/edit/:id`: The edit page for a specific crewmate, also using a URL parameter for the ID.
    - `*`: A catch-all route that redirects to the home page for any unmatched paths.
  - `Link` components are used for declarative navigation.
  - `Navigate` is used for programmatic redirection (e.g., if a user tries to access a protected route without being logged in).
*/
