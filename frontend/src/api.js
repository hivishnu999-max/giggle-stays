const TOKEN_KEY = 'ssh_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== '' && v != null && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  me: () => request('/auth/me'),
  cities: () => request('/cities'),
  featured: () => request('/featured'),
  listings: (filters) => request(`/listings${qs(filters)}`),
  listing: (id) => request(`/listings/${id}`),
  similar: (id) => request(`/listings/${id}/similar`),
  enquire: (id, b) => request(`/listings/${id}/enquiries`, { method: 'POST', body: b }),
  tenantEnquiries: () => request('/tenant/enquiries'),
  favorites: (full = false) => request(`/favorites${full ? '?full=true' : ''}`),
  toggleFavorite: (id) => request(`/favorites/${id}`, { method: 'POST' }),
  ownerStats: () => request('/owner/stats'),
  ownerListings: () => request('/owner/listings'),
  ownerEnquiries: () => request('/owner/enquiries'),
  createListing: (b) => request('/listings', { method: 'POST', body: b }),
  updateListing: (id, b) => request(`/listings/${id}`, { method: 'PUT', body: b }),
  setAvailability: (id, available) => request(`/listings/${id}/availability`, { method: 'PATCH', body: { available } }),
  deleteListing: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
  setEnquiryStatus: (id, status) => request(`/enquiries/${id}`, { method: 'PATCH', body: { status } }),
};

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const TYPES = ['PG', 'Hostel', 'Apartment', 'House'];
export const SHARING = ['Single', 'Double', 'Triple', 'Entire home'];
export const GENDERS = ['Any', 'Men', 'Women'];
export const AMENITIES = [
  'WiFi',
  'Meals',
  'AC',
  'Laundry',
  'Power backup',
  'Parking',
  'Attached bath',
  'Hot water',
  'CCTV',
  'Housekeeping',
  'Gym',
  'Security'
];

export const PRESET_PHOTOS = [
  { label: 'Cozy Room (PG)', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Modern Studio (AC)', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Student Hostel', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80' },
  { label: '2BHK Apartment', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Luxury Condo', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Techie Coliving', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Independent Villa', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Neat Hostel Dorm', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80' },
];

