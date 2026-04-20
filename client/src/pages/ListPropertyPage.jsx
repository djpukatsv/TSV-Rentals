import React, { useState } from 'react';

export default function ListPropertyPage({ navigate, user }) {
  const [form, setForm] = useState({
    title: '', type: 'house', price: '', bedrooms: '', bathrooms: '',
    address: '', suburb: '', postcode: '',
    description: '', availableDate: '', leaseLength: '',
    petFriendly: false, airCon: false, pool: false, garage: false,
    furnished: false, billsIncluded: false, virtualTour: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit() {
    setError('');
    if (!form.title || !form.price || !form.bedrooms || !form.bathrooms || !form.address || !form.suburb || !form.postcode) {
      setError('Please fill in all required fields');
      return;
    }
    if (!user) { navigate('auth'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price),
          bedrooms: parseInt(form.bedrooms),
          bathrooms: parseInt(form.bathrooms),
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setSuccess(true);
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Listing submitted!</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Your property is now live on TSV Rentals.</p>
          <button onClick={() => navigate('home')} className="btn btn-primary">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const SUBURBS = ['Kirwan', 'Townsville City', 'Thuringowa', 'Aitkenvale', 'Mundingburra', 'Hyde Park', 'Kelso', 'Idalia', 'Hermit Park', 'North Ward', 'South Townsville', 'Belgian Gardens'];

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 24, maxWidth: 700 }}>

        <button
          onClick={() => navigate('home')}
          style={{ background: 'none', border: 'none', color: '#1a56a0', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>List your property</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Free to list — reach Townsville renters today</p>

        {!user && (
          <div style={{ background: '#e6f1fb', border: '1px solid #b5d4f4', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: '#1a56a0' }}>
              You need an account to list a property.{' '}
              <span onClick={() => navigate('auth')} style={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Sign in or create one free
              </span>
            </p>
          </div>
        )}

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Property details</h3>

          <div className="form-group">
            <label>Listing title *</label>
            <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Spacious 3 bed house with pool — Kirwan" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Property type *</label>
              <select value={form.type} onChange={e => update('type', e.target.value)}>
                <option value="house">House</option>
                <option value="unit">Unit</option>
                <option value="townhouse">Townhouse</option>
                <option value="room">Room</option>
              </select>
            </div>
            <div className="form-group">
              <label>Weekly rent ($) *</label>
              <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 450" />
            </div>
            <div className="form-group">
              <label>Bedrooms *</label>
              <select value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)}>
                <option value="">Select</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Bathrooms *</label>
              <select value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)}>
                <option value="">Select</option>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Location</h3>
          <div className="form-group">
            <label>Street address *</label>
            <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="e.g. 12 Mango Street" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Suburb *</label>
              <select value={form.suburb} onChange={e => update('suburb', e.target.value)}>
                <option value="">Select suburb</option>
                {SUBURBS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Postcode *</label>
              <input value={form.postcode} onChange={e => update('postcode', e.target.value)} placeholder="e.g. 4817" />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Features</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'petFriendly', label: '🐾 Pet friendly' },
              { key: 'airCon', label: '❄️ Air conditioning' },
              { key: 'pool', label: '🏊 Pool' },
              { key: 'garage', label: '🚗 Garage' },
              { key: 'furnished', label: '🛋️ Furnished' },
              { key: 'billsIncluded', label: '💡 Bills included' },
            ].map(f => (
              <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form[f.key]}
                  onChange={e => update(f.key, e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#1a56a0' }}
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>More details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Available from</label>
              <input type="date" value={form.availableDate} onChange={e => update('availableDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Lease length</label>
              <select value={form.leaseLength} onChange={e => update('leaseLength', e.target.value)}>
                <option value="">Negotiable</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
                <option value="Month to month">Month to month</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={4}
              placeholder="Describe the property, neighbourhood, nearby amenities..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="form-group">
            <label>Virtual tour link (YouTube or 360 tour)</label>
            <input value={form.virtualTour} onChange={e => update('virtualTour', e.target.value)} placeholder="https://youtube.com/..." />
          </div>
        </div>

        {error && <p className="error" style={{ marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: 14, fontSize: 16, marginBottom: 40 }}
        >
          {loading ? 'Submitting...' : '🏠 List my property for free'}
        </button>

      </div>
    </div>
  );
}
