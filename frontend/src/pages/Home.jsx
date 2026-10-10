import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, TYPES } from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import { useAuth } from '../auth.jsx';
import { useToast } from '../components/Toast.jsx';

const BUDGETS = [
  ['', 'Any budget'],
  ['5000', 'Up to ₹5,000'],
  ['10000', 'Up to ₹10,000'],
  ['15000', 'Up to ₹15,000'],
  ['25000', 'Up to ₹25,000'],
];

export default function Home({ favIds = [], onToggleFav }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    gender: searchParams.get('gender') || '',
    maxRent: searchParams.get('maxRent') || '',
    sort: 'rating_desc',
  });

  const [cities, setCities] = useState([]);
  const [featuredStays, setFeaturedStays] = useState([]);
  const [listings, setListings] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  // Load cities & featured listings on mount
  useEffect(() => {
    api.cities().then(setCities).catch(() => {});
    api.featured().then(setFeaturedStays).catch(() => {});
  }, []);

  // Sync searchParams if URL changes
  useEffect(() => {
    const urlCity = searchParams.get('city');
    const urlType = searchParams.get('type');
    if (urlCity !== null && urlCity !== filters.city) setFilter('city', urlCity);
    if (urlType !== null && urlType !== filters.type) setFilter('type', urlType);
  }, [searchParams]);

  // Fetch filtered listings with debounce
  useEffect(() => {
    setState('loading');
    const t = setTimeout(() => {
      api.listings(filters)
        .then((rows) => {
          setListings(rows);
          setState('done');
        })
        .catch((e) => {
          setError(e.message);
          setState('error');
        });
    }, 200);
    return () => clearTimeout(t);
  }, [filters]);

  const activeFilterList = useMemo(() => {
    const list = [];
    if (filters.city) list.push({ key: 'city', label: `City: ${filters.city}` });
    if (filters.type) list.push({ key: 'type', label: `Type: ${filters.type}` });
    if (filters.gender) list.push({ key: 'gender', label: `For: ${filters.gender}` });
    if (filters.maxRent) list.push({ key: 'maxRent', label: `Budget ≤ ₹${Number(filters.maxRent).toLocaleString('en-IN')}` });
    if (filters.q) list.push({ key: 'q', label: `"${filters.q}"` });
    return list;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({ q: '', city: '', type: '', gender: '', maxRent: '', sort: 'rating_desc' });
  };

  return (
    <main>
      {/* ---------- Hero Section ---------- */}
      <section className="hero-wrapper">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            100% Zero Brokerage · Direct Owner Connect
          </div>

          <h1>
            Discover Your Next Stay with <br />
            <span className="gradient-text">Complete Comfort & Freedom</span>
          </h1>

          <p>
            Find verified PGs, student hostels, shared rooms, and private apartments across India’s premier education and tech hubs.
          </p>

          <div className="hero-stats-row">
            <div className="stat-chip">
              <span className="stat-number">500+</span>
              <span className="stat-label">Verified Beds</span>
            </div>
            <div className="stat-chip">
              <span className="stat-number">₹0</span>
              <span className="stat-label">Brokerage Fee</span>
            </div>
            <div className="stat-chip">
              <span className="stat-number">4.9 ★</span>
              <span className="stat-label">Average Tenant Rating</span>
            </div>
            <div className="stat-chip">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Dedicated Support</span>
            </div>
          </div>

          {/* Quick City Pills */}
          <div className="city-pills-bar">
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '0.25rem' }}>Popular Cities:</span>
            {['Chennai', 'Bengaluru', 'Coimbatore', 'Tiruvannamalai'].map((c) => (
              <button
                key={c}
                type="button"
                className={`city-pill ${filters.city.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                onClick={() => setFilter('city', filters.city === c ? '' : c)}
              >
                📍 {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Search & Filter Plate ---------- */}
      <section className="filter-plate" aria-label="Search and filter options">
        <div className="plate-card">
          {/* Segmented Type Bar */}
          <div className="type-segmented">
            <button
              type="button"
              className={`type-btn ${filters.type === '' ? 'active' : ''}`}
              onClick={() => setFilter('type', '')}
            >
              All Types
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`type-btn ${filters.type === t ? 'active' : ''}`}
                onClick={() => setFilter('type', filters.type === t ? '' : t)}
              >
                {t === 'PG' && '🏠 '}
                {t === 'Hostel' && '🎓 '}
                {t === 'Apartment' && '🏢 '}
                {t === 'House' && '🏡 '}
                {t}
              </button>
            ))}
          </div>

          {/* Filter Inputs Grid */}
          <div className="filter-grid">
            <div className="input-icon-wrap">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search area, landmark or stay name..."
                value={filters.q}
                onChange={(e) => setFilter('q', e.target.value)}
                aria-label="Search area, landmark or stay name"
              />
            </div>

            <select
              value={filters.city}
              onChange={(e) => setFilter('city', e.target.value)}
              aria-label="Filter by City"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilter('gender', e.target.value)}
              aria-label="Filter by Gender Suitability"
            >
              <option value="">Anyone</option>
              <option value="Men">Men only</option>
              <option value="Women">Women only</option>
            </select>

            <select
              value={filters.maxRent}
              onChange={(e) => setFilter('maxRent', e.target.value)}
              aria-label="Filter by Budget"
            >
              {BUDGETS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              aria-label="Sort Stays"
            >
              <option value="rating_desc">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="rent_asc">Rent: Low to High</option>
              <option value="rent_desc">Rent: High to Low</option>
            </select>

            {activeFilterList.length > 0 && (
              <button
                type="button"
                className="btn ghost small"
                onClick={clearAllFilters}
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {activeFilterList.length > 0 && (
            <div className="active-filters-chips">
              <span style={{ color: 'var(--text-muted)' }}>Active filters:</span>
              {activeFilterList.map((item) => (
                <span key={item.key} className="filter-tag">
                  {item.label}
                  <button type="button" onClick={() => setFilter(item.key, '')} title="Remove filter">×</button>
                </span>
              ))}
              <button type="button" className="clear-all-link" onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Spotlight Featured Stays (When no strict search applied) ---------- */}
      {featuredStays.length > 0 && activeFilterList.length === 0 && (
        <section className="page-container" style={{ paddingBottom: '0' }}>
          <div className="featured-section">
            <div className="section-head" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2>✨ Spotlight Verified Stays</h2>
                <p className="muted" style={{ fontSize: '0.9rem' }}>
                  Hand-picked properties with top amenities, verified landlords, and high reviews.
                </p>
              </div>
            </div>
            <div className="featured-grid">
              {featuredStays.map((l) => (
                <ListingCard
                  key={`feat-${l.id}`}
                  listing={l}
                  isFav={favIds.includes(l.id)}
                  onToggleFav={onToggleFav}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Main Listings Grid Section ---------- */}
      <section className="page-container">
        <div className="section-head">
          <div>
            <h2>
              Available Stays
              {state === 'done' && (
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  ({listings.length} {listings.length === 1 ? 'stay' : 'stays'} available)
                </span>
              )}
            </h2>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              Browse through verified accommodation ready for immediate move-in.
            </p>
          </div>

          <div className="view-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              ☰ List
            </button>
          </div>
        </div>

        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--brand)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Finding the best stays for you...
            </div>
            <p className="muted">Fetching verified real-time rates and availability.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="plate-card" style={{ textAlign: 'center', padding: '3rem 1rem', borderColor: 'var(--rose)' }}>
            <p className="error" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{error}</p>
            <button className="btn ghost" onClick={() => window.location.reload()}>Try Refreshing</button>
          </div>
        )}

        {state === 'done' && listings.length === 0 && (
          <div className="plate-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No stays match your criteria</h3>
            <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Try loosening your filters, expanding your budget range, or clearing the city selection.
            </p>
            <button className="btn primary-glow" onClick={clearAllFilters}>
              Reset All Filters
            </button>
          </div>
        )}

        {state === 'done' && listings.length > 0 && (
          <div className={`property-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                isFav={favIds.includes(l.id)}
                onToggleFav={onToggleFav}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
