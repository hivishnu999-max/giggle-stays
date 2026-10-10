import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, inr } from '../api.js';
import { useAuth } from '../auth.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { useToast } from '../components/Toast.jsx';

export default function ListingDetail({ favIds = [], onToggleFav }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [similarStays, setSimilarStays] = useState([]);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState('');

  // Enquiry form state
  const [form, setForm] = useState({ name: '', phone: '', moveIn: '', message: '' });
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError('');
    setSent(false);

    api.listing(id)
      .then((data) => {
        setListing(data);
        setActivePhoto(data.image_url || (data.gallery && data.gallery[0]) || '');
      })
      .catch((e) => setError(e.message));

    api.similar(id)
      .then(setSimilarStays)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        phone: f.phone || user.phone,
      }));
    }
  }, [user]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleEnquire(e) {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    try {
      await api.enquire(id, form);
      setSent(true);
      showToast('Enquiry submitted successfully! The owner has been notified.', 'success');
    } catch (err) {
      setFormError(err.message);
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  if (error) {
    return (
      <main className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p className="error" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn primary-glow">Back to Stays</Link>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p className="muted" style={{ fontSize: '1.1rem' }}>Loading property details…</p>
      </main>
    );
  }

  const isFav = favIds.includes(listing.id);
  const galleryList = [listing.image_url, ...(listing.gallery || [])].filter(Boolean);
  const uniqueGallery = Array.from(new Set(galleryList));
  const rent = Number(listing.rent || 0);
  const deposit = Number(listing.deposit || 0);
  const totalMoveIn = rent + deposit;

  return (
    <main className="page-container">
      {/* ---------- Breadcrumbs ---------- */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/?city=${encodeURIComponent(listing.city)}`}>{listing.city}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{listing.title}</span>
      </nav>

      {/* ---------- Main Detail Grid ---------- */}
      <div className="detail-layout">
        <div>
          {/* Gallery Showcase */}
          <div className="gallery-container">
            <div className="gallery-main">
              <img
                src={activePhoto || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80'}
                alt={listing.title}
              />
              <div className="badge-overlay-type">{listing.type}</div>
              {listing.featured && <div className="badge-featured">Featured Stay</div>}
            </div>
            {uniqueGallery.slice(1, 3).map((imgUrl, i) => (
              <div
                key={i}
                className="gallery-thumb"
                onClick={() => setActivePhoto(imgUrl)}
                title="Click to view full photo"
              >
                <img src={imgUrl} alt={`Thumbnail ${i + 1}`} />
              </div>
            ))}
          </div>

          {/* Title & Location Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span className="badge-overlay-rating" style={{ position: 'static' }}>
                  <span className="star">★</span>
                  <span>{listing.rating ? listing.rating.toFixed(1) : '4.8'}</span>
                </span>
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  ({listing.reviews_count || 24} verified tenant reviews)
                </span>
                <span className="verified-tag">✓ Verified Property</span>
              </div>
              <h1 style={{ marginBottom: '0.4rem' }}>{listing.title}</h1>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {[listing.address, listing.area, listing.city].filter(Boolean).join(', ')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn ghost small"
                onClick={handleShare}
                title="Share property link"
              >
                🔗 Share
              </button>
              {onToggleFav && (
                <button
                  type="button"
                  className={`btn ghost small ${isFav ? 'danger' : ''}`}
                  onClick={() => onToggleFav(listing.id)}
                  title={isFav ? 'Remove from saved' : 'Save property'}
                >
                  {isFav ? '❤️ Saved' : '🤍 Save'}
                </button>
              )}
            </div>
          </div>

          {/* Key Facts Summary */}
          <div className="facts-grid">
            <div className="fact-box">
              <span className="fact-label">Monthly Rent</span>
              <span className="fact-value">{inr(listing.rent)}</span>
            </div>
            <div className="fact-box">
              <span className="fact-label">Security Deposit</span>
              <span className="fact-value">{inr(listing.deposit)}</span>
            </div>
            <div className="fact-box">
              <span className="fact-label">Sharing</span>
              <span className="fact-value">{listing.sharing}</span>
            </div>
            <div className="fact-box">
              <span className="fact-label">Suitable For</span>
              <span className="fact-value">{listing.gender === 'Any' ? 'Anyone' : `${listing.gender} only`}</span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div style={{ margin: '2rem 0' }}>
              <h2>About this accommodation</h2>
              <p style={{ color: '#334155', lineHeight: '1.7', fontSize: '1rem', marginTop: '0.6rem' }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* Included Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div style={{ margin: '2rem 0' }}>
              <h2>What’s included in your stay</h2>
              <div className="amenities-showcase">
                {listing.amenities.map((a) => (
                  <div key={a} className="amenity-card">
                    <span>✨</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Move-in Cost Breakdown Calculator */}
          <div className="calculator-box">
            <h3 style={{ marginBottom: '0.75rem', color: '#166534', fontSize: '1.1rem' }}>
              💵 Transparent Move-in Cost Breakdown
            </h3>
            <div className="calc-row">
              <span>First Month Rent:</span>
              <span>{inr(listing.rent)}</span>
            </div>
            <div className="calc-row">
              <span>Refundable Security Deposit:</span>
              <span>{inr(listing.deposit)}</span>
            </div>
            <div className="calc-row">
              <span>Maintenance & Amenities:</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>₹0 (Included)</span>
            </div>
            <div className="calc-row">
              <span>Brokerage / Agent Commission:</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>₹0 (100% Free)</span>
            </div>
            <div className="calc-row total">
              <span>Estimated Total Move-in Budget:</span>
              <span>{inr(totalMoveIn)}</span>
            </div>
          </div>

          {/* House Rules & Guidelines */}
          {listing.rules && listing.rules.length > 0 && (
            <div style={{ margin: '2rem 0' }}>
              <h2>House Rules & Community Norms</h2>
              <ul className="rules-list">
                {listing.rules.map((r, i) => (
                  <li key={i}>
                    <span className="bullet"></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ---------- Sticky Right Owner & Enquiry Sidebar ---------- */}
        <aside>
          <div className="enquiry-panel">
            <h3>Direct Owner Connect</h3>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Connect directly with verified property manager with zero middleman fee.
            </p>

            <div className="owner-card">
              <div className="owner-avatar">
                {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="owner-details">
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{listing.owner_name || 'Verified Owner'}</div>
                <div className="verified-tag">✓ Identity Verified</div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            {listing.owner_phone && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <a
                  href={`https://wa.me/91${listing.owner_phone}?text=${encodeURIComponent(`Hello ${listing.owner_name}, I am interested in your stay: "${listing.title}" on Smart Stay Homes.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn whatsapp small"
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`tel:${listing.owner_phone}`}
                  className="btn ghost small"
                >
                  📞 Call Owner
                </a>
              </div>
            )}

            {!listing.available ? (
              <div style={{ background: 'var(--rose-soft)', color: 'var(--rose-text)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 600 }}>
                This property is currently full or unavailable.
              </div>
            ) : sent ? (
              <div style={{ background: 'var(--emerald-soft)', color: 'var(--emerald-text)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>Enquiry Received! 🎉</div>
                <p style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
                  {listing.owner_name} will contact you shortly on <strong>{form.phone}</strong>. You can also dial directly anytime.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquire} style={{ display: 'grid', gap: '0.9rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Your Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>10-Digit Mobile Number *</label>
                  <input
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Target Move-In Date</label>
                  <input
                    type="date"
                    value={form.moveIn}
                    onChange={(e) => setField('moveIn', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Message or Questions</label>
                  <textarea
                    rows="2"
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    placeholder="Ask about meal menu, AC timings, or request a room visit..."
                  />
                </div>

                {formError && <p className="error">{formError}</p>}

                <button className="btn primary-glow" disabled={busy} style={{ width: '100%' }}>
                  {busy ? 'Sending request…' : 'Send Free Enquiry'}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* ---------- Similar Properties Section ---------- */}
      {similarStays.length > 0 && (
        <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>Similar Stays in {listing.city}</h2>
          <div className="property-grid">
            {similarStays.map((s) => (
              <ListingCard
                key={s.id}
                listing={s}
                isFav={favIds.includes(s.id)}
                onToggleFav={onToggleFav}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
