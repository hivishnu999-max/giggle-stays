import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar({ favCount = 0 }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    try {
      const u = await login('owner@smartstay.test', 'owner123');
      navigate('/dashboard');
    } catch (e) {
      console.error('Demo login error:', e);
    }
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand-wrapper">
        <div className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div className="brand-title">
          SmartStay<span>Homes</span>
        </div>
      </Link>

      <nav>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Browse Stays
            </NavLink>
          </li>
          
          <li>
            <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              Saved
              {favCount > 0 && <span className="nav-badge">{favCount}</span>}
            </NavLink>
          </li>

          {user?.role === 'tenant' && (
            <li>
              <NavLink to="/my-enquiries" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Inquiries
              </NavLink>
            </li>
          )}

          {user?.role === 'owner' && (
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Owner Hub
              </NavLink>
            </li>
          )}

          {user ? (
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="user-badge" title={`Signed in as ${user.email}`}>
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span>{user.name.split(' ')[0]}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'capitalize' }}>({user.role})</span>
              </div>
              <button 
                className="btn dark-ghost small" 
                onClick={logout}
                style={{ padding: '0.35rem 0.75rem' }}
              >
                Log out
              </button>
            </li>
          ) : (
            <>
              <li>
                <button
                  type="button"
                  className="btn small"
                  onClick={handleQuickDemo}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
                  }}
                  title="Instant 1-Click Demo Owner Login"
                >
                  ⚡ Demo Owner
                </button>
              </li>
              <li>
                <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Log in
                </NavLink>
              </li>
              <li>
                <Link to="/register" className="btn small primary-glow">
                  List Property
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
