import React, { useState, useEffect } from 'react';
export default function ListingPage({ listing, navigate, user }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function sendEnquiry() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, ...form })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setSent(true);
    } catch {
      setError('Could not send enquiry');
    } finally {
      setLoading(false);
    }
  }

  if (!listing) return null;

  const features = [
    { key: 'pet_friendly', label: 'Pet friendly' },
    { key: 'air_con', label: 'Air conditioning' },
    { key: 'pool', label: 'Pool' },
    { key: 'garage', label: 'Garage' },
    { key: 'furnished', label: 'Furnished' },
    { key: 'bills_included', label: 'Bills included' },
  ];

  const fullAddress = `${listing.address}, ${listing.suburb} QLD ${listing.postcode}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${listing.lat},${listing.lng}`;
  const embedUrl = listing.lat && listing.lng
    ? `https://maps.google.com/maps?q=${listing.lat},${listing.lng}&z=16&output=embed`
    : `https://maps.google.com/maps?q=${encodedAddress}&z=16&output=embed`;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 24 }}>

        <button
          onClick={() => navigate('home')}
          style={{ background: 'none', border: 'none', color: '#1a56a0', cursor: 'pointer', fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          Back to listings
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* Image */}
            <div style={{
              height: 300,
              background: listing.cover_image ? `url(${listing.cover_image}) center/cover` : 'linear-gradient(135deg, #b5d4f4, #e6f1fb)',
              borderRadius: 10,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!listing.cover_image && <span style={{ fontSize: 60, opacity: 0.3 }}>house</span>}
            </div>

            {/* Title & price */}
            <div style={{ marginBottom: 20 }}>
              {listing.promoted === 1 && (
                <span className="badge badge-amber" style={{ marginBottom: 8, display: 'inline-block' }}>Featured</span>
              )}
              <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{listing.title}</h1>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>{fullAddress}</p>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1a56a0' }}>
                ${listing.price} <span style={{ fontSize: 15, fontWeight: 400, color: '#6b7280' }}>/ week</span>
              </div>
            </div>

            {/* Key details */}
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Property details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Type', value: listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1) },
                  { label: 'Bedrooms', value: listing.bedrooms },
                  { label: 'Bathrooms', value: listing.bathrooms },
                  { label: 'Available', value: listing.available_date || 'Now' },
                  { label: 'Lease', value: listing.lease_length || 'Negotiable' },
                  { label: 'Suburb', value: listing.suburb },
                ].map(d => (
                  <div key={d.label}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{d.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Features</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {features.map(f => (
                  <span
                    key={f.key}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 13,
                      background: listing[f.key] === 1 ? '#e6f1fb' : '#f3f4f6',
                      color: listing[f.key] === 1 ? '#1a56a0' : '#9ca3af',
                      textDecoration: listing[f.key] === 1 ? 'none' : 'line-through'
                    }}
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>About this property</h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{listing.description}</p>
              </div>
            )}

            {/* Map */}
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Location</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{fullAddress}</p>

              <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                <iframe
                  title="Property location"
                  src={embedUrl}
                  width="100%"
                  height="280"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '9px 14px',
                    borderRadius: 8,
                    background: '#1a56a0',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Open in Google Maps
                </a>
                
                  href={streetViewUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '9px 14px',
                    borderRadius: 8,
                    background: '#f3f4f6',
                    color: '#374151',
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  Street View
                </a>
              </div>
            </div>

            {/* Virtual tour */}
            {listing.virtual_tour && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Virtual tour</h3>
                <a href={listing.virtual_tour} target="_blank" rel="noreferrer"
                  style={{ color: '#1a56a0', fontSize: 14 }}>
                  View virtual tour
                </a>
              </div>
            )}
          </div>

          {/* Right column - Enquiry form */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Enquire about this property</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                Listed by {listing.landlord_name}
              </p>

              {sent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>Done</div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>Enquiry sent!</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>The landlord will be in touch shortly.</p>
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label>Your name</label>
                    <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Smith" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone (optional)</label>
                    <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="04xx xxx xxx" />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => update('message', e.target.value)}
                      rows={4}
                      placeholder="Hi, I'm interested in this property..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  {error && <p className="error" style={{ marginBottom: 10 }}>{error}</p>}
                  <button
                    onClick={sendEnquiry}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: 11, fontSize: 15 }}
                  >
                    {loading ? 'Sending...' : 'Send enquiry'}
                  </button>
                  <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                    Your details are only shared with the landlord
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
