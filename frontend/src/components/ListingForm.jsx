import { useState } from 'react';
import { AMENITIES, SHARING, TYPES, GENDERS, PRESET_PHOTOS } from '../api.js';

const empty = {
  title: '',
  type: 'PG',
  city: '',
  area: '',
  address: '',
  rent: '',
  deposit: '',
  sharing: 'Single',
  gender: 'Any',
  amenities: ['WiFi', 'Power backup'],
  description: '',
  image_url: PRESET_PHOTOS[0].url,
  rules: ['Gate closing: 10:30 PM', 'No smoking'],
  featured: false
};

export default function ListingForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...empty,
          ...initial,
          image_url: initial.image_url || PRESET_PHOTOS[0].url,
          rules: Array.isArray(initial.rules) ? initial.rules : empty.rules,
          amenities: Array.isArray(initial.amenities) ? initial.amenities : empty.amenities
        }
      : empty
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [customPhoto, setCustomPhoto] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  
  const toggleAmenity = (a) => {
    set(
      'amenities',
      form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a]
    );
  };

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="plate-card" onSubmit={submit} style={{ maxWidth: '840px', margin: '0 auto 2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h2>{initial ? 'Edit Property Details' : 'List a New Property'}</h2>
          <p className="muted" style={{ fontSize: '0.9rem' }}>Fill in property information to publish and receive verified tenant enquiries.</p>
        </div>
        <button type="button" className="btn ghost small" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        <div>
          <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Property Title *</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Spacious Luxury PG near Metro Station, Anna Nagar"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Property Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Room / Sharing</label>
            <select value={form.sharing} onChange={(e) => set('sharing', e.target.value)}>
              {SHARING.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Suitable For</label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g === 'Any' ? 'Anyone (Men/Women)' : `${g} only`}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>City *</label>
            <input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="e.g. Chennai, Bengaluru"
              required
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Locality / Area *</label>
            <input
              value={form.area}
              onChange={(e) => set('area', e.target.value)}
              placeholder="e.g. Velachery, HSR Layout"
              required
            />
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Street Address (Optional)</label>
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="e.g. 14, 2nd Cross Street, near Central Mall"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Monthly Rent (₹) *</label>
            <input
              type="number"
              min="1"
              value={form.rent}
              onChange={(e) => set('rent', e.target.value)}
              placeholder="e.g. 8500"
              required
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Security Deposit (₹)</label>
            <input
              type="number"
              min="0"
              value={form.deposit}
              onChange={(e) => set('deposit', e.target.value)}
              placeholder="e.g. 15000"
            />
          </div>
        </div>

        {/* Photo Selection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>Property Cover Photo</label>
            <button
              type="button"
              className="clear-all-link"
              onClick={() => setCustomPhoto(!customPhoto)}
            >
              {customPhoto ? 'Choose from gallery presets' : 'Or enter custom image URL'}
            </button>
          </div>

          {customPhoto ? (
            <input
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          ) : (
            <div>
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Select a high-resolution photo preset for instant showcase:
              </p>
              <div className="preset-photos-picker">
                {PRESET_PHOTOS.map((p) => (
                  <div
                    key={p.url}
                    className={`preset-photo-item ${form.image_url === p.url ? 'selected' : ''}`}
                    onClick={() => set('image_url', p.url)}
                  >
                    <img src={p.url} alt={p.label} />
                    <span className="preset-photo-label">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Included Amenities */}
        <div>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Amenities & Facilities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {AMENITIES.map((a) => {
              const active = form.amenities.includes(a);
              return (
                <button
                  type="button"
                  key={a}
                  className={`type-btn ${active ? 'active' : ''}`}
                  onClick={() => toggleAmenity(a)}
                >
                  {active ? '✓ ' : '+ '} {a}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Description & Highlights</label>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Mention room size, meal details, gate timings, nearby tech parks or colleges..."
          />
        </div>

        {error && <div className="error" style={{ padding: '0.5rem 0' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn primary-glow" disabled={busy}>
            {busy ? 'Saving property…' : initial ? 'Update Property' : 'Publish Property Now'}
          </button>
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
