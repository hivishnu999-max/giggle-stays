import { Link } from 'react-router-dom';
import { inr } from '../api.js';

export function Thumb({ listing }) {
  const fallback = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
  return (
    <div className="card-media">
      <img
        className="card-img"
        src={listing.image_url || fallback}
        alt={listing.title}
        loading="lazy"
        onError={(e) => { e.target.src = fallback; }}
      />
      <div className="badge-overlay-type">{listing.type}</div>
      <div className="badge-overlay-rating">
        <span className="star">★</span>
        <span>{listing.rating ? listing.rating.toFixed(1) : '4.8'}</span>
      </div>
      {listing.featured && <div className="badge-featured">Featured</div>}
    </div>
  );
}

export default function ListingCard({ listing, isFav = false, onToggleFav }) {
  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFav) onToggleFav(listing.id);
  };

  return (
    <Link to={`/stay/${listing.id}`} className="property-card" id={`stay-card-${listing.id}`}>
      <div style={{ position: 'relative' }}>
        <Thumb listing={listing} />
        {onToggleFav && (
          <button
            type="button"
            className={`fav-btn ${isFav ? 'active' : ''}`}
            onClick={handleFavClick}
            aria-label={isFav ? 'Remove from saved' : 'Save property'}
            title={isFav ? 'Remove from saved' : 'Save property'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="card-content">
        <div className="card-price-row">
          <div className="card-price">
            {inr(listing.rent)} <span>/ month</span>
          </div>
          <div className="card-deposit">
            Deposit: {inr(listing.deposit)}
          </div>
        </div>

        <h3 className="card-title">{listing.title}</h3>

        <div className="card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{listing.area}, {listing.city}</span>
        </div>

        <div className="card-meta-chips">
          <span className="chip highlight">{listing.sharing}</span>
          <span className="chip">{listing.gender === 'Any' ? 'Anyone' : `${listing.gender} only`}</span>
          {listing.amenities && listing.amenities.slice(0, 2).map((a) => (
            <span key={a} className="chip">{a}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
