import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-grid">
        <div className="footer-col">
          <div className="brand-wrapper" style={{ marginBottom: '1rem' }}>
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="brand-title">
              SmartStay<span>Homes</span>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '320px', lineHeight: '1.6' }}>
            India’s smarter rental platform for students, working professionals, and families. Zero brokerage, verified properties, and direct owner connections.
          </p>
        </div>

        <div className="footer-col">
          <h4>Popular Cities</h4>
          <ul>
            <li><Link to="/?city=Chennai">Chennai Stays</Link></li>
            <li><Link to="/?city=Bengaluru">Bengaluru Coliving</Link></li>
            <li><Link to="/?city=Coimbatore">Coimbatore Hostels</Link></li>
            <li><Link to="/?city=Tiruvannamalai">Tiruvannamalai Homes</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Stay Types</h4>
          <ul>
            <li><Link to="/?type=PG">Paying Guest (PG)</Link></li>
            <li><Link to="/?type=Hostel">Student Hostels</Link></li>
            <li><Link to="/?type=Apartment">Flats & Apartments</Link></li>
            <li><Link to="/?type=House">Independent Houses</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Trust & Safety</h4>
          <ul>
            <li><span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>🛡️ 100% Verified Owners</span></li>
            <li><span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>💰 Zero Brokerage Policy</span></li>
            <li><span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>🔒 Secure Direct Chat</span></li>
            <li><Link to="/register">List Your Space</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} Smart Stay Homes. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security</span>
        </div>
      </div>
    </footer>
  );
}
