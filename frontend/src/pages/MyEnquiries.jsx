import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, inr } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function MyEnquiries() {
  const { user, ready } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      api.tenantEnquiries()
        .then((data) => {
          setEnquiries(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [user]);

  if (!ready) return <main className="page-container"><p className="muted">Loading…</p></main>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="page-container">
      <div className="section-head">
        <div>
          <h1>My Sent Enquiries ({enquiries.length})</h1>
          <p className="muted">Track the status of the rooms and properties you have contacted.</p>
        </div>
        <Link to="/" className="btn ghost small">← Browse More Stays</Link>
      </div>

      {error && <div className="error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {loading ? (
        <p className="muted" style={{ padding: '3rem 0', textAlign: 'center' }}>Loading your enquiries…</p>
      ) : enquiries.length === 0 ? (
        <div className="plate-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
          <h2>No enquiries sent yet</h2>
          <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            When you ask a property owner about room availability, your requests and owner contacts will appear here.
          </p>
          <Link to="/" className="btn primary-glow">Find a Stay Now</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {enquiries.map((e) => (
            <div key={e.id} className="pipeline-card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {e.image_url && (
                  <img
                    src={e.image_url}
                    alt={e.listing_title}
                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                )}
                <div>
                  <Link to={`/stay/${e.listing_id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    {e.listing_title}
                  </Link>
                  <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {e.area}, {e.city} · Rent: {inr(e.rent)}/mo · Owner: {e.owner_name}
                  </div>
                  {e.message && (
                    <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.4rem', background: 'var(--bg-subtle)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      💬 "{e.message}"
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span className={`status-badge ${e.status}`}>
                  {e.status === 'new' && '⏳ Under Review'}
                  {e.status === 'contacted' && '📞 Owner Contacted You'}
                  {e.status === 'closed' && '✅ Visit Closed / Completed'}
                </span>
                {e.owner_phone && (
                  <a href={`tel:${e.owner_phone}`} className="btn ghost small">
                    Call Owner ({e.owner_phone})
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
