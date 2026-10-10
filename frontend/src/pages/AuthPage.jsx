import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { useToast } from '../components/Toast.jsx';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: isRegister ? 'owner' : 'tenant',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = isRegister
        ? await register(form)
        : await login(form.email, form.password);

      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate(user.role === 'owner' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const fillDemoOwner = async () => {
    setError('');
    setBusy(true);
    try {
      const user = await login('owner@smartstay.test', 'owner123');
      showToast(`Logged in as Demo Owner!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div className="plate-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1>{isRegister ? 'Create Your Account' : 'Welcome Back'}</h1>
          <p className="muted" style={{ fontSize: '0.95rem' }}>
            {isRegister
              ? 'Join Smart Stay Homes to find verified rooms or manage your properties.'
              : 'Sign in to access your saved stays or property dashboard.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>I want to:</label>
                <div className="type-segmented" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
                  <button
                    type="button"
                    className={`type-btn ${form.role === 'tenant' ? 'active' : ''}`}
                    onClick={() => setField('role', 'tenant')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Find a Stay
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${form.role === 'owner' ? 'active' : ''}`}
                    onClick={() => setField('role', 'owner')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    List / Manage Properties
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Mobile Number *</label>
                <input
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && <div className="error" style={{ fontSize: '0.9rem' }}>{error}</div>}

          <button className="btn primary-glow" disabled={busy} style={{ width: '100%', marginTop: '0.5rem' }}>
            {busy ? 'Please wait…' : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        {!isRegister && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border)', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>Testing the property manager?</p>
            <button
              type="button"
              className="btn ghost small"
              disabled={busy}
              onClick={fillDemoOwner}
              style={{ width: '100%' }}
            >
              ⚡ 1-Click Demo Owner Login (owner@smartstay.test)
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {isRegister ? (
            <p className="muted">
              Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in here</Link>
            </p>
          ) : (
            <p className="muted">
              Don’t have an account yet? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
