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

  const fullAddress = listing.address + ', ' + listing.suburb + ' QLD ' + listing.postcode;
  const encodedAddress = encodeURIComponent(fullAddress);
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodedAddress;
  const streetUrl = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + listing.lat + ',' + listing.lng;
  const embedUrl = listing.lat && listing.lng
    ? 'https://maps.google.com/maps?q=' + listing.lat + ',' + listing.lng + '&z=16&output=embed'
    : 'https://maps.google.com/maps?q=' + encodedAddress + '&z=16&output=embed';

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 24 }}>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: '#1a56a0', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>
          Back to listings
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          <div>

            <Gallery listingId={listing.id} coverImage={listing.cover_image} />

            <div style={{ marginBottom: 20 }}>
              {listing.promoted === 1 && <span className="badge badge-amber" style={{ marginBottom: 8, display: 'inline-block' }}>Featured</span>}
              <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{listing.title}</h1>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>{fullAddress}</p>

              {listing.agent_logo && (
                <div style={{ marginBottom: 10 }}>
                  <img src={listing.agent_logo} alt="agent" style={{ height: 60, objectFit: 'contain', background: 'white', padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                </div>
              )}

              <div style={{ fontSize: 26, fontWeight: 700, color: '#1a56a0' }}>
                ${listing.price} <span style={{ fontSize: 15, fontWeight: 400, color: '#6b7280' }}>/ week</span>
              </div>
            </div>

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

            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Features</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {features.map(f => (
                  <span key={f.key} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 13, background: listing[f.key] === 1 ? '#e6f1fb' : '#f3f4f6', color: listing[f.key] === 1 ? '#1a56a0' : '#9ca3af', textDecoration: listing[f.key] === 1 ? 'none' : 'line-through' }}>
                    {f.label}
                  </span>
                ))}
              </div>
            </div>

            {listing.description && (
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>About this property</h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{listing.description}</p>
              </div>
            )}

            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Location</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{fullAddress}</p>
              <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                <iframe title="map" src={embedUrl} width="100%" height="280" style={{ border: 0, display: 'block' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => window.open(mapsUrl, '_blank')} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, background: '#1a56a0', color: '#fff', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Open in Google Maps</button>
                <button onClick={() => window.open(streetUrl, '_blank')} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, background: '#f3f4f6', color: '#374151', fontSize: 13, fontWeight: 500, border: '1px solid #e5e7eb', cursor: 'pointer' }}>Street View</button>
              </div>
            </div>

            {listing.virtual_tour && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Virtual tour</h3>
                <a href={listing.virtual_tour} target="_blank" rel="noreferrer" style={{ color: '#1a56a0', fontSize: 14 }}>View virtual tour</a>
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ padding: 24 }}>
              {listing.agent_logo && (
                <div style={{ textAlign: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
                  <img src={listing.agent_logo} alt="agent" style={{ height: 50, objectFit: 'contain' }} />
                </div>
              )}
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Enquire about this property</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Listed by {listing.landlord_name}</p>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
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
                    <textarea value={form.message} onChange={e => update('message', e.target.value)} rows={4} placeholder="Hi, I'm interested in this property..." style={{ resize: 'vertical' }} />
                  </div>
                  {error && <p className="error" style={{ marginBottom: 10 }}>{error}</p>}
                  <button onClick={sendEnquiry} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 11, fontSize: 15 }}>
                    {loading ? 'Sending...' : 'Send enquiry'}
                  </button>
                  <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>Your details are only shared with the landlord</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Gallery({ listingId, coverImage }) {
  const [images, setImages] = useState([coverImage].filter(Boolean));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/listings/' + listingId).then(r => r.json()).then(data => {
      if (data.images && data.images.length > 0) {
        setImages(data.images.map(i => i.url));
      }
    });
  }, [listingId]);

  if (images.length === 0) {
    return <div style={{ height: 550, background: 'linear-gradient(135deg, #b5d4f4, #e6f1fb)', borderRadius: 10, marginBottom: 20 }} />;
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ position: 'relative', height: 550, borderRadius: 10, overflow: 'hidden' }}>
        <img src={images[current]} alt="property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {images.length > 1 && (
          <div>
            <button onClick={() => setCurrent(c => (c - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>{'<'}</button>
            <button onClick={() => setCurrent(c => (c + 1) % images.length)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>{'>'}</button>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: i === current ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12, padding: '3px 8px', borderRadius: 4 }}>{current + 1} / {images.length}</div>
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto' }}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="thumb" onClick={() => setCurrent(i)} style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: i === current ? '2px solid #1a56a0' : '2px solid transparent', flexShrink: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}
