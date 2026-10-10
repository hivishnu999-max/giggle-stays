import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import { useAuth } from '../auth.jsx';

export default function SavedStays({ favIds = [], onToggleFav }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.favorites(true)
        .then((data) => {
          setFavorites(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // If not logged in, fetch from public listings matching local storage IDs
      api.listings({})
        .then((all) => {
          setFavorites(all.filter((item) => favIds.includes(item.id)));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, favIds]);

  const handleToggle = (id) => {
    if (onToggleFav) onToggleFav(id);
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="page-container">
      <div className="section-head">
        <div>
          <h1>Saved Stays ({favorites.length})</h1>
          <p className="muted">Your shortlisted properties for easy comparison and booking.</p>
        </div>
        <Link to="/" className="btn ghost small">← Browse More Stays</Link>
      </div>

      {loading ? (
        <p className="muted" style={{ padding: '3rem 0', textAlign: 'center' }}>Loading your shortlisted stays…</p>
      ) : favorites.length === 0 ? (
        <div className="plate-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤍</div>
          <h2>No saved stays yet</h2>
          <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Click the heart icon on any property card to save your favorite rooms and apartments here.
          </p>
          <Link to="/" className="btn primary-glow">Explore Stays</Link>
        </div>
      ) : (
        <div className="property-grid">
          {favorites.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFav={true}
              onToggleFav={handleToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
}
