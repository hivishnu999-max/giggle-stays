// Adds a demo owner and premium sample listings. Safe to run more than once.
const bcrypt = require('bcryptjs');
const db = require('./db');

const email = 'owner@smartstay.test';
let owner = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!owner) {
  const info = db
    .prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run('Demo Owner', email, '9876543210', bcrypt.hashSync('owner123', 10), 'owner');
  owner = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
}

const samples = [
  {
    title: 'Sunrise Ladies PG near Anna Nagar Metro',
    type: 'PG',
    city: 'Chennai',
    area: 'Anna Nagar',
    address: '12, 2nd Avenue, near Roundtana',
    rent: 7500,
    deposit: 15000,
    sharing: 'Double',
    gender: 'Women',
    amenities: ['WiFi', 'Meals', 'Laundry', 'CCTV', 'Hot water', 'Power backup'],
    description: 'Vibrant twin-sharing air-conditioned rooms, hygienic home-style three meals a day, high-speed fiber internet, and biometric security. Located just a 4-minute walk from Anna Nagar Tower Metro Station.',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviews_count: 28,
    rules: ['Gate closing: 10:30 PM', 'Female guests allowed', 'No smoking / alcohol', '30 days notice period'],
    featured: 1
  },
  {
    title: 'Single room with attached bath, Velachery',
    type: 'PG',
    city: 'Chennai',
    area: 'Velachery',
    address: 'Near Phoenix MarketCity bypass road',
    rent: 11000,
    deposit: 22000,
    sharing: 'Single',
    gender: 'Any',
    amenities: ['WiFi', 'AC', 'Attached bath', 'Power backup', 'Housekeeping', 'Parking'],
    description: 'Executive private room tailored for working tech professionals. Includes dedicated ergonomic workstation, 1.5-ton split AC, western attached bathroom, and weekly deep cleaning service.',
    image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviews_count: 19,
    rules: ['Quiet hours after 11 PM', 'Visitors allowed until 9 PM', '1 month notice period'],
    featured: 1
  },
  {
    title: 'Green Court Boys Hostel',
    type: 'Hostel',
    city: 'Coimbatore',
    area: 'Peelamedu',
    address: 'Opp. PSG College of Arts & Tech',
    rent: 4500,
    deposit: 9000,
    sharing: 'Triple',
    gender: 'Men',
    amenities: ['WiFi', 'Meals', 'Laundry', 'Hot water', 'CCTV'],
    description: 'Affordable, student-friendly hostel within walking distance to PSG institutions and Avinashi Road. Features spacious study halls, south & north Indian food mess, and round-the-clock water and power.',
    image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.6,
    reviews_count: 34,
    rules: ['Curfew: 10:00 PM', 'ID card verification mandatory', 'Mess timing strictly adhered'],
    featured: 0
  },
  {
    title: '2BHK Luxury Apartment, RS Puram',
    type: 'Apartment',
    city: 'Coimbatore',
    area: 'RS Puram',
    address: 'DB Road, West Extension',
    rent: 21000,
    deposit: 60000,
    sharing: 'Entire home',
    gender: 'Any',
    amenities: ['Parking', 'Power backup', 'CCTV', 'WiFi', 'Housekeeping', 'Gym'],
    description: 'Impeccable semi-furnished 2BHK flat featuring imported modular kitchen, teak wood wardrobes, balcony overlooking green avenues, high-speed elevator, and reserved basement parking.',
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.95,
    reviews_count: 14,
    rules: ['Family or working bachelors welcome', 'Pets subject to society guidelines', 'Standard agreement apply'],
    featured: 1
  },
  {
    title: 'Lakeview 1BHK for families & techies',
    type: 'Apartment',
    city: 'Bengaluru',
    area: 'Marathahalli',
    address: 'Near Kundalahalli Gate & Outer Ring Road',
    rent: 19500,
    deposit: 60000,
    sharing: 'Entire home',
    gender: 'Any',
    amenities: ['Parking', 'Power backup', 'CCTV', 'Housekeeping', 'WiFi'],
    description: 'Peaceful gated community apartment located 10 minutes from Prestige Tech Park and Cessna Business Park. Features panoramic lake view, sunlit hall, 100% DG backup, and clubhouse access.',
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.85,
    reviews_count: 22,
    rules: ['2 months refundable deposit', '24x7 security surveillance', 'Quiet community norms'],
    featured: 1
  },
  {
    title: 'Techie Co-living Hub, HSR Layout',
    type: 'PG',
    city: 'Bengaluru',
    area: 'HSR Layout',
    address: 'Sector 2, 27th Main Road',
    rent: 13500,
    deposit: 27000,
    sharing: 'Double',
    gender: 'Any',
    amenities: ['WiFi', 'AC', 'Meals', 'Laundry', 'Housekeeping', 'Power backup'],
    description: 'Next-gen co-living community offering cozy twin sharing suites, gigabit Wi-Fi, modern co-working lounge with coffee bar, gaming console area, and chef-curated wholesome buffet meals.',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviews_count: 45,
    rules: ['24x7 keyless entry', 'Respect fellow co-living residents', 'Events every weekend'],
    featured: 1
  },
  {
    title: 'Serene Independent Villa near Girivalam Path',
    type: 'House',
    city: 'Tiruvannamalai',
    area: 'Chengam Road',
    address: 'Near Sri Ramana Maharshi Ashram Road',
    rent: 9000,
    deposit: 25000,
    sharing: 'Entire home',
    gender: 'Any',
    amenities: ['Parking', 'Power backup', 'Hot water', 'WiFi'],
    description: 'Peaceful 2-bedroom independent house with private terrace overlooking holy Arunachala hill. Surrounded by organic trees, quiet meditation atmosphere, and pure mountain air.',
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviews_count: 31,
    rules: ['Peaceful spiritual environment', 'Vegetarian preferred', 'Long & short stays welcome'],
    featured: 1
  },
  {
    title: 'Scholars Hostel for Women',
    type: 'Hostel',
    city: 'Tiruvannamalai',
    area: 'Kilnachipattu',
    address: 'Behind Government Arts College & Collectorate',
    rent: 3800,
    deposit: 7000,
    sharing: 'Triple',
    gender: 'Women',
    amenities: ['WiFi', 'Meals', 'CCTV', 'Hot water', 'Power backup'],
    description: 'Safe, warden-supervised hostel for college students and competitive exam aspirants. Clean dining hall serving nutritious South Indian meals, filtered drinking water, and high security.',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.75,
    reviews_count: 17,
    rules: ['Strict warden supervision', 'Curfew: 9:00 PM', 'No unauthorized visitors'],
    featured: 0
  }
];

// Clean existing sample listings for demo owner and reinsert with full rich metadata
db.prepare('DELETE FROM listings WHERE owner_id = ?').run(owner.id);

const insert = db.prepare(
  `INSERT INTO listings (owner_id, title, type, city, area, address, rent, deposit, sharing, gender, amenities, description, image_url, gallery, rating, reviews_count, rules, featured)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

for (const s of samples) {
  insert.run(
    owner.id,
    s.title,
    s.type,
    s.city,
    s.area,
    s.address,
    s.rent,
    s.deposit,
    s.sharing,
    s.gender,
    JSON.stringify(s.amenities),
    s.description,
    s.image_url,
    JSON.stringify(s.gallery),
    s.rating,
    s.reviews_count,
    JSON.stringify(s.rules),
    s.featured
  );
}

console.log(`Successfully seeded ${samples.length} rich listings with full galleries, ratings and rules.`);
console.log('Demo owner credentials: owner@smartstay.test / owner123');

