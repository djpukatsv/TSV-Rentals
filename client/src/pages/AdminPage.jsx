import React, { useState, useEffect } from 'react';

const SUBURBS = ['Kirwan', 'Townsville City', 'Thuringowa', 'Aitkenvale', 'Mundingburra', 'Hyde Park', 'Kelso', 'Idalia', 'Hermit Park', 'North Ward', 'South Townsville', 'Belgian Gardens', 'Bohle Plains', 'Castle Hill', 'Rosslea', 'Cranbrook', 'Heatley', 'Annandale', 'Wulguru', 'Rasmussen'];

const empty = { title: '', type: 'house', price: '', bedrooms: '', bathrooms: '', address: '', suburb: 'Kirwan', postcode: '', description: '', availableDate: '', leaseLength: '12 months', petFriendly: false, airCon: false, pool: false, garage: false, furnished: false, billsIncluded: false, imageUrl: '', contactName: 'TSV Rentals', contactEmail: '', contactPhone: '' };

export default function AdminPage({ navigate }) {
  const [form, setForm] = useState(empty);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    const res = await fetch('/api/listings');
    const data = await res.json();
    setListings(data.listings || []);
  }

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/listing?key=tsvadmin2026', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setSuccess('Listing added successfully!');
      setForm(empty);
      fetchListings();
    } catch {
      setError('Could not add listing');
    } finally {
      setLoading(false);
    }
  }

  async function deleteListing(id) {
    if (!confirm('Remove this listing?')) return;
    await fetch('/api/admin/listing/' + id + '?key=tsvadmin2026', { method: 'DELETE' });
    fetchListings();
  }

  const input = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );

  const checkbox = (label, key) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 8 }}>
      <input type="checkbox" checked={form[key]} onChange={e => update(key, e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a56a0' }}>Admin — Add Listing</h1>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>Back to site</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: 10, padding: 24, border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>New Listing</h2>

          {input('Title', 'title', 'text', 'e.g. Spacious 3 Bed House — Kirwan')}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>Type</label>
            <select value={form.type} onChange={e => update('type', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
              <option value="house">House</option>
              <option value="unit">Unit</option>
              <option value="townhouse">Townhouse</option>
              <option value="studio">Studio</option>
              <option value="room">Room</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Price/week</label>
              <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="450" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} placeholder="3" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} placeholder="1" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>

          {input('Street address', 'address', 'text', 'e.g. 14 Bandicoot Drive')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Suburb</label>
              <select value={form.suburb} onChange={e => update('suburb', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
                {SUBURBS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Postcode</label>
              <input type="text" value={form.postcode} onChange={e => update('postcode', e.target.value)} placeholder="4817" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Describe the property..." style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Available date</label>
              <input type="date" value={form.availableDate} onChange={e => update('availableDate', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Lease length</label>
              <select value={form.leaseLength} onChange={e => update('leaseLength', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
                <option value="Negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          {input('Photo URL (optional)', 'imageUrl', 'text', 'https://i.ibb.co/...')}

          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Features</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {checkbox('Pet friendly', 'petFriendly')}
              {checkbox('Air conditioning', 'airCon')}
              {checkbox('Pool', 'pool')}
              {checkbox('Garage', 'garage')}
              {checkbox('Furnished', 'furnished')}
              {checkbox('Bills included', 'billsIncluded')}
            </div>
          </div>

          <div style={{ background: '#f0f7ff', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Contact (shown on listing)</p>
            {input('Contact name', 'contactName', 'text', 'TSV Rentals')}
            {input('Contact phone', 'contactPhone', 'text', '07 4700 0000')}
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          {success && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 10 }}>{success}</p>}

          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '11px', background: '#1a56a0', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Adding...' : 'Add Listing'}
          </button>
        </div>

        {/* Current listings */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Current Listings ({listings.length})</h2>
          {listings.map(l => (
            <div key={l.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{l.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{l.suburb} — ${l.price}/wk — {l.bedrooms} bed</div>
              </div>
              <button onClick={() => deleteListing(l.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                Remove
              </button>
            </div>
          ))}
          {listings.length === 0 && <p style={{ fontSize: 14, color: '#6b7280' }}>No listings yet.</p>}
        </div>
      </div>
    </div>
  );
}
