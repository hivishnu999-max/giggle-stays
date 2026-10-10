import { useEffect, useState, useCallback } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { api } from './api.js';
import { ToastProvider, useToast } from './components/Toast.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import SavedStays from './pages/SavedStays.jsx';
import MyEnquiries from './pages/MyEnquiries.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';

function AppContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favIds, setFavIds] = useState(() => {
    try {
      const stored = localStorage.getItem('ssh_favs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load favorites from backend if logged in
  useEffect(() => {
    if (user) {
      api.favorites(false)
        .then((ids) => {
          if (Array.isArray(ids)) {
            setFavIds(ids);
            localStorage.setItem('ssh_favs', JSON.stringify(ids));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Toggle favorite handler
  const handleToggleFav = useCallback(async (id) => {
    const isCurrentlyFav = favIds.includes(id);
    const newFavs = isCurrentlyFav
      ? favIds.filter((x) => x !== id)
      : [...favIds, id];

    setFavIds(newFavs);
    localStorage.setItem('ssh_favs', JSON.stringify(newFavs));

    if (user) {
      try {
        const res = await api.toggleFavorite(id);
        showToast(
          res.favorited ? 'Added to Saved Stays! ❤️' : 'Removed from Saved Stays',
          'info'
        );
      } catch {
        // Fallback already saved locally
      }
    } else {
      showToast(
        !isCurrentlyFav ? 'Added to Saved Stays! ❤️' : 'Removed from Saved Stays',
        'info'
      );
    }
  }, [favIds, user, showToast]);

  return (
    <>
      <Navbar favCount={favIds.length} />
      <Routes>
        <Route path="/" element={<Home favIds={favIds} onToggleFav={handleToggleFav} />} />
        <Route path="/stay/:id" element={<ListingDetail favIds={favIds} onToggleFav={handleToggleFav} />} />
        <Route path="/saved" element={<SavedStays favIds={favIds} onToggleFav={handleToggleFav} />} />
        <Route path="/my-enquiries" element={<MyEnquiries />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="*"
          element={
            <main className="page-container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
              <h1>Page not found</h1>
              <p className="muted" style={{ marginBottom: '1.5rem' }}>The page you are looking for does not exist or has been moved.</p>
              <Link to="/" className="btn primary-glow">Back to Stays</Link>
            </main>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
