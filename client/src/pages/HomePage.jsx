import { useState, useEffect } from 'react';

const SUBURBS = [
  'Aitkenvale', 'Annandale', 'Belgian Gardens', 'Bohle', 'Bohle Plains',
  'Burdell', 'Castle Hill', 'Cluden', 'Condon', 'Cranbrook', 'Currajong',
  'Deeragun', 'Douglas', 'Garbutt', 'Gulliver', 'Heatley', 'Heritage Park',
  'Hermit Park', 'Hyde Park', 'Idalia', 'Kelso', 'Kirwan', 'Mount Louisa',
  'Mount St John', 'Mount Stuart', 'Mundingburra', 'Mysterton', 'North Ward',
  'Oonoonba', 'Pallarenda', 'Pimlico', 'Rasmussen', 'Rosslea', 'Rowes Bay',
  'Shaw', 'South Townsville', 'Stuart', 'Thuringowa', 'Townsville City',
  'Vincent', 'Wulguru'
];

export default function HomePage({ navigate, user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    suburb: '', type: '', maxPrice: '', bedrooms: '',
    petFriendly: false, airCon: false, pool: false, garage: false
  });

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.suburb) params.append('suburb', filters.suburb);
      if (filters.type) params.append('type', filters.type);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      if (filters.petFriendly) params.append('petFriendly', 'true');
      if (filters.airCon) params.append('airCon', 'true');
      if (filters.pool) params.append('pool', 'true');
      if (filters.garage) params.append('garage', 'true');
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  function handleSearch() { fetchListings(); }

  return (
    <div className="page">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(rgba(10,30,70,0.55), rgba(10,30,70,0.55)), url(https://i.ibb.co/fdVVYpww/1000006105.png) center/cover no-repeat',
        padding: '40px 20px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 600, marginBottom: 6 }}>
            Find your next Townsville home
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 24 }}>
            Townsville's own rental platform — free to list, easy to find
          </p>
          <div style={{
            background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center',
            maxWidth: 580, margin: '0 auto', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <select value={filters.type} onChange={e => handleFilter('type', e.target.value)}
              style={{ border: 'none', padding: '12px 14px', fontSize: 14, color: '#6b7280', outline: 'none', borderRight: '1px solid #e5e7eb' }}>
              <option value="">All types</option>
              <option value="house">House</option>
              <option value="unit">Unit</option>
              <option value="apartment">Apartment</option>
              <option value="room">Room</option>
              <option value="townhouse">Townhouse</option>
            </select>
            <select value={filters.suburb} onChange={e => handleFilter('suburb', e.target.value)}
              style={{ border: 'none', padding: '12px 14px', fontSize: 14, color: '#6b7280', outline: 'none', flex: 1, borderRight: '1px solid #e5e7eb' }}>
              <option value="">All suburbs</option>
              {SUBURBS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.maxPrice} onChange={e => handleFilter('maxPrice', e.target.value)}
              style={{ border: 'none', padding: '12px 14px', fontSize: 14, color: '#6b7280', outline: 'none', borderRight: '1px solid #e5e7eb' }}>
              <option value="">Any price</option>
              <option value="300">Under $300pw</option>
              <option value="400">Under $400pw</option>
              <option value="500">Under $500pw</option>
              <option value="600">Under $600pw</option>
            </select>
            <button onClick={handleSearch}
              style={{ background: '#1a56a0', color: 'white', border: 'none', padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div style={{
        background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 20px',
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'
      }}>
        {[
          { label: '1 bed', key: 'bedrooms', value: '1' },
          { label: '2 bed', key: 'bedrooms', value: '2' },
          { label: '3 bed', key: 'bedrooms', value: '3' },
          { label: '4+ bed', key: 'bedrooms', value: '4' },
        ].map(f => (
          <button key={f.label}
            onClick={() => handleFilter(f.key, filters[f.key] === f.value ? '' : f.value)}
            style={{
              background: filters[f.key] === f.value ? '#1a56a0' : 'white',
              color: filters[f.key] === f.value ? 'white' : '#6b7280',
              border: '1px solid', borderColor: filters[f.key] === f.value ? '#1a56a0' : '#e5e7eb',
              borderRadius: 20, padding: '4px 14px', fontSize: 13, cursor: 'pointer'
            }}>
            {f.label}
          </button>
        ))}
        {[
          { label: '🐾 Pet friendly', key: 'petFriendly' },
          { label: '❄️ Air con', key: 'airCon' },
          { label: '🏊 Pool', key: 'pool' },
          { label: '🚗 Garage', key: 'garage' },
        ].map(f => (
          <button key={f.key}
            onClick={() => handleFilter(f.key, !filters[f.key])}
            style={{
              background: filters[f.key] ? '#1a56a0' : 'white',
              color: filters[f.key] ? 'white' : '#6b7280',
              border: '1px solid', borderColor: filters[f.key] ? '#1a56a0' : '#e5e7eb',
              borderRadius: 20, padding: '4px 14px', fontSize: 13, cursor: 'pointer'
            }}>
            {f.label}
          </button>
        ))}
        <button onClick={handleSearch}
          style={{ marginLeft: 'auto', background: '#1a56a0', color: 'white', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>
          Apply
        </button>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>
            {loading ? 'Loading...' : `${listings.length} properties found`}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <p style={{ fontSize: 16, marginBottom: 6 }}>No listings yet</p>
            <p style={{ fontSize: 14 }}>Be the first to list a property!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} onClick={() => navigate('listing', listing)} />
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', marginTop: 40, display: 'flex' }}>
        {[
          { num: listings.length, label: 'Active listings' },
          { num: 'Free', label: 'To list your property' },
          { num: 'Local', label: 'Townsville only' },
          { num: '100%', label: 'Independent' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '16px 8px', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1a56a0' }}>{s.num}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Security Shield Trust Bar */}
      <div style={{ background: '#f0f7ff', borderTop: '1px solid #dbeafe', padding: '18px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" fill="#1a56a0" opacity="0.15" stroke="#1a56a0" strokeWidth="1.5"/>
              <path d="M9 12l2 2 4-4" stroke="#1a56a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a56a0' }}>Security & Trust</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', title: 'Industry-standard encryption', desc: 'All data is encrypted in transit and at rest using AES-256.' },
              { icon: '🇦🇺', title: 'Australian-based security', desc: 'Your data is stored and protected under Australian privacy laws.' },
              { icon: '✅', title: 'Verified landlords', desc: "Look for the verified badge — landlords who've completed identity checks." },
              { icon: '🛡️', title: 'No data selling', desc: 'We never sell your personal information to third parties.' },
            ].map((item, i) => (
              <div key={i} style={{ flex: '1 1 180px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing, onClick }) {
  return (
    <div className="card" onClick={onClick}
      style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{
        height: 170,
        background: listing.cover_image ? `url(${listing.cover_image}) center/cover` : 'linear-gradient(135deg, #b5d4f4, #e6f1fb)',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {!listing.cover_image && <span style={{ fontSize: 40, opacity: 0.4 }}>🏠</span>}
        <div style={{
          position: 'absolute', top: 8, left: 8, background: 'rgba(20,60,120,0.85)',
          color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 4
        }}>
          {listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1)}
        </div>
        {listing.promoted === 1 && (
          <div style={{
            position: 'absolute', top: 8, right: 8, background: '#f59e0b',
            color: '#412402', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600
          }}>Featured</div>
        )}
        {listing.verified === 1 && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8, background: 'rgba(26,86,160,0.92)',
            color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" fill="white" opacity="0.3" stroke="white" strokeWidth="1.5"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Verified
          </div>
        )}
        {listing.agent_logo && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'white', borderRadius: 6, padding: '3px 6px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
          }}>
            <img src={listing.agent_logo} alt="agent" style={{ height: 40, objectFit: 'contain', display: 'block' }} />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1a56a0', marginBottom: 2 }}>
          ${listing.price} <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>/ week</span>
        </div>
        <div style={{ fontSize: 13, color: '#1a1a2e', marginBottom: 2 }}>
          {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.suburb}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{listing.address}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {listing.pet_friendly === 1 && <span className="tag">🐾 Pets ok</span>}
          {listing.air_con === 1 && <span className="tag">❄️ Air con</span>}
          {listing.pool === 1 && <span className="tag">🏊 Pool</span>}
          {listing.garage === 1 && <span className="tag">🚗 Garage</span>}
          {listing.furnished === 1 && <span className="tag">🛋️ Furnished</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            {listing.available_date ? `Avail ${listing.available_date}` : 'Avail now'}
          </span>
          <button onClick={e => { e.stopPropagation(); onClick(); }}
            style={{ background: '#1a56a0', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
            View
          </button>
        </div>
      </div>
    </div>
  );
}
