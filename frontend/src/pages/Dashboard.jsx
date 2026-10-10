import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, inr } from '../api.js';
import { useAuth } from '../auth.jsx';
import ListingForm from '../components/ListingForm.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Dashboard() {
  const { user, ready } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState('properties'); // 'properties' | 'enquiries'
  const [enquiryFilter, setEnquiryFilter] = useState('all'); // 'all' | 'new' | 'contacted' | 'closed'
  const [listings, setListings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | listing
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState(null);

  const loadData = useCallback(() => {
    Promise.all([
      api.ownerListings(),
      api.ownerEnquiries(),
      api.ownerStats()
    ])
      .then(([l, e, s]) => {
        setListings(l);
        setEnquiries(e);
        setStats(s);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (user?.role === 'owner') {
      loadData();
    }
  }, [user, loadData]);

  if (!ready) return <main className="page-container"><p className="muted">Loading dashboard…</p></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'owner') {
    return (
      <main className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
        <h2>Owner Accounts Only</h2>
        <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
          You are currently signed in as a tenant. Create or sign into an owner account to list and manage properties.
        </p>
        <Link to="/register" className="btn primary-glow">Create Owner Account</Link>
      </main>
    );
  }

  const handleToggleAvailability = async (l) => {
    setError('');
    setBusyAction(l.id);
    try {
      await api.setAvailability(l.id, !l.available);
      showToast(`Property marked as ${!l.available ? 'Available' : 'Full / Hidden'}`, 'success');
      loadData();
    } catch (e) {
      setError(e.message);
      showToast(e.message, 'error');
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteListing = async (l) => {
    if (window.confirm(`Are you sure you want to delete "${l.title}"? All tenant enquiries for this property will also be removed.`)) {
      setError('');
      setBusyAction(l.id);
      try {
        await api.deleteListing(l.id);
        showToast('Property deleted successfully', 'info');
        loadData();
      } catch (e) {
        setError(e.message);
        showToast(e.message, 'error');
      } finally {
        setBusyAction(null);
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    setError('');
    try {
      await api.setEnquiryStatus(id, status);
      showToast(`Enquiry marked as ${status}`, 'success');
      loadData();
    } catch (e) {
      setError(e.message);
      showToast(e.message, 'error');
    }
  };

  async function handleSaveListing(form) {
    if (editing === 'new') {
      await api.createListing(form);
      showToast('New property created successfully!', 'success');
    } else {
      await api.updateListing(editing.id, form);
      showToast('Property updated successfully!', 'success');
    }
    setEditing(null);
    loadData();
  }

  const newCount = enquiries.filter((e) => e.status === 'new').length;
  const filteredEnquiries = enquiries.filter((e) => {
    if (enquiryFilter === 'all') return true;
    return e.status === enquiryFilter;
  });

  return (
    <main className="page-container">
      {/* Top Header */}
      <div className="section-head">
        <div>
          <h1>Property Management Hub</h1>
          <p className="muted">Manage your listed units, track occupancy, and convert tenant enquiries.</p>
        </div>
        {!editing && (
          <button className="btn primary-glow" onClick={() => setEditing('new')}>
            + Add New Property
          </button>
        )}
      </div>

      {error && <div className="error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      {/* KPI Overview Grid */}
      {stats && !editing && (
        <div className="dashboard-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-title">Total Units</span>
            <span className="kpi-number">{stats.total}</span>
            <span className="kpi-subtext" style={{ color: 'var(--text-muted)' }}>
              {stats.active} Available · {stats.hidden} Full
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-title">Monthly Revenue Potential</span>
            <span className="kpi-number" style={{ color: 'var(--brand)' }}>
              {inr(stats.potentialRent)}
            </span>
            <span className="kpi-subtext">Across active units</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-title">Total Inquiries</span>
            <span className="kpi-number">{stats.totalEnquiries}</span>
            <span className="kpi-subtext">All time tenant leads</span>
          </div>

          <div className="kpi-card" style={{ borderColor: newCount > 0 ? 'var(--rose)' : 'var(--border)' }}>
            <span className="kpi-title">Action Needed</span>
            <span className="kpi-number" style={{ color: newCount > 0 ? 'var(--rose)' : 'var(--emerald-text)' }}>
              {newCount}
            </span>
            <span className="kpi-subtext" style={{ color: newCount > 0 ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
              {newCount > 0 ? 'New unread enquiries' : 'All enquiries handled'}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-title">Conversion Rate</span>
            <span className="kpi-number">{stats.conversionRate}%</span>
            <span className="kpi-subtext">{stats.closedEnquiries} closed tenants</span>
          </div>
        </div>
      )}

      {/* Edit or Create View */}
      {editing ? (
        <ListingForm
          initial={editing === 'new' ? null : editing}
          onSave={handleSaveListing}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          {/* Segmented Navigation */}
          <div className="type-segmented" style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`type-btn ${tab === 'properties' ? 'active' : ''}`}
              onClick={() => setTab('properties')}
            >
              🏢 Properties ({listings.length})
            </button>
            <button
              type="button"
              className={`type-btn ${tab === 'enquiries' ? 'active' : ''}`}
              onClick={() => setTab('enquiries')}
            >
              📬 Enquiries & Leads {newCount > 0 && `(${newCount} New)`}
            </button>
          </div>

          {/* Properties Tab */}
          {tab === 'properties' && (
            listings.length === 0 ? (
              <div className="plate-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                <h2>You haven't added any properties yet</h2>
                <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  List your PG, hostel, apartment or house today to connect directly with tenants looking for accommodation.
                </p>
                <button className="btn primary-glow" onClick={() => setEditing('new')}>
                  Add Your First Property
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {listings.map((l) => (
                  <div key={l.id} className="pipeline-card" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img
                        src={l.image_url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=80'}
                        alt={l.title}
                        style={{ width: '90px', height: '65px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Link to={`/stay/${l.id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                            {l.title}
                          </Link>
                          <span className={`status-badge ${l.available ? 'closed' : 'new'}`}>
                            {l.available ? '● Active' : '○ Full'}
                          </span>
                        </div>
                        <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          {l.area}, {l.city} · <strong>{inr(l.rent)}</strong>/month · {l.enquiry_count || 0} enquiries received
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn ghost small"
                        disabled={busyAction === l.id}
                        onClick={() => handleToggleAvailability(l)}
                      >
                        {l.available ? 'Mark as Full' : 'Mark Available'}
                      </button>
                      <button
                        className="btn ghost small"
                        onClick={() => setEditing(l)}
                      >
                        Edit Details
                      </button>
                      <button
                        className="btn danger small"
                        disabled={busyAction === l.id}
                        onClick={() => handleDeleteListing(l)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Enquiries Tab */}
          {tab === 'enquiries' && (
            <div>
              {/* Enquiry Sub-filter */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {['all', 'new', 'contacted', 'closed'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`city-pill ${enquiryFilter === f ? 'active' : ''}`}
                    style={{
                      background: enquiryFilter === f ? 'var(--bg-dark)' : 'var(--bg-subtle)',
                      color: enquiryFilter === f ? '#fff' : 'var(--text-main)',
                      borderColor: 'var(--border)'
                    }}
                    onClick={() => setEnquiryFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {filteredEnquiries.length === 0 ? (
                <div className="plate-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
                  <h3>No enquiries in this view</h3>
                  <p className="muted">They will show up here as soon as prospective tenants contact you.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {filteredEnquiries.map((e) => (
                    <div key={e.id} className="pipeline-card">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{e.name}</span>
                          <span className={`status-badge ${e.status}`}>
                            {e.status === 'new' && '🔴 New Request'}
                            {e.status === 'contacted' && '🟡 In Progress'}
                            {e.status === 'closed' && '🟢 Completed'}
                          </span>
                        </div>

                        <div className="muted" style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>
                          Interested in: <strong>{e.listing_title}</strong>
                          {e.move_in && ` · Target Move-in: ${e.move_in}`}
                        </div>

                        {e.message && (
                          <div style={{ background: 'var(--bg-subtle)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', marginTop: '0.6rem', fontSize: '0.9rem', color: '#334155' }}>
                            "{e.message}"
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={`https://wa.me/91${e.phone}?text=${encodeURIComponent(`Hi ${e.name}, this is regarding your enquiry for ${e.listing_title} on Smart Stay Homes.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn whatsapp small"
                          >
                            💬 WhatsApp
                          </a>
                          <a href={`tel:${e.phone}`} className="btn ghost small">
                            📞 {e.phone}
                          </a>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                          <select
                            value={e.status}
                            onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed / Converted</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
