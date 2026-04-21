import React, { useState, useEffect } from 'react';

const SUBURBS = ['Kirwan', 'Townsville City', 'Thuringowa', 'Aitkenvale', 'Mundingburra', 'Hyde Park', 'Kelso', 'Idalia', 'Hermit Park', 'North Ward', 'South Townsville', 'Belgian Gardens', 'Bohle Plains', 'Castle Hill', 'Rosslea', 'Cranbrook', 'Heatley', 'Annandale', 'Wulguru', 'Rasmussen'];
const empty = { title: '', type: 'house', price: '', bedrooms: '', bathrooms: '', address: '', suburb: 'Kirwan', postcode: '', description: '', availableDate: '', leaseLength: '12 months', petFriendly: false, airCon: false, pool: false, garage: false, furnished: false, billsIncluded: false, contactName: 'TSV Rentals', contactPhone: '' };

export default function AdminPage({ navigate }) {
  const [form, setForm] = useState(empty);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    const res = await fetch('/api/listings');
    const data = await res.json();
    setListings(data.listings || []);
  }

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    setPreviews(newFiles.map(f => URL.createObjectURL(f)));
  }

  function removePreview(i) {
    const newFiles = imageFiles.filter((_, idx) => idx !== i);
    setImageFiles(newFiles);
    setPreviews(newFiles.map(f => URL.createObjectURL(f)));
  }

  function startEdit(listing) {
    setEditingId(listing.id);
    setImageFiles([]);
    setPreviews(listing.cover_image ? [listing.cover_image] : []);
    setForm({
      title: listing.title || '',
      type: listing.type || 'house',
      price: listing.price || '',
      bedrooms: listing.bedrooms || '',
      bathrooms: listing.bathrooms || '',
      address: listing.address || '',
      suburb: listing.suburb || 'Kirwan',
      postcode: listing.postcode || '',
      description: listing.description || '',
      availableDate: listing.available_date || '',
      leaseLength: listing.lease_length || '12 months',
      petFriendly: listing.pet_friendly === 1,
      airCon: listing.air_con === 1,
      pool: listing.pool === 1,
      garage: listing.garage === 1,
      furnished: listing.furnished === 1,
      billsIncluded: listing.bills_included === 1,
      contactName: listing.landlord_name || 'TSV Rentals',
      contactPhone: listing.landlord_phone || '',
    });
    window.scrollTo(0, 0);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
    setImageFiles([]);
    setPreviews([]);
    setError('');
    setSuccess('');
  }

  async function submit() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const url = editingId
        ? '/api/admin/listing/' + editingId + '?key=tsvadmin2026'
        : '/api/admin/listing?key=tsvadmin2026';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }

      const listingId = editingId || data.id;

      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('images', f));
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.urls && uploadData.urls.length > 0) {
          await fetch('/api/admin/listing/' + listingId + '/images?key=tsvadmin2026', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: uploadData.urls })
          });
        }
      }

      setSuccess(editingId ? 'Listing updated!' : 'Listing added!');
      setForm(empty);
      setEditingId(null);
      setImageFiles([]);
      setPreviews([]);
      fetchListings();
    } catch (err) {
      setError('Could not save listing: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteListing(id) {
    if (!confirm('Remove this listing?')) return;
    await fetch('/api/admin/listing/' + id + '?key=tsvadmin2026', { method: 'DELETE' });
    if (editingId === id) cancelEdit();
    fetchListings();
  }

  const inp = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );

  const chk = (label, key) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 8 }}>
      <input type="checkbox" checked={form[key]} onChange={e => update(key, e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a56a0' }}>Admin — {editingId ? 'Edit Listing' : 'Add Listing'}</h1>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>Back to site</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 24, border: editingId ? '2px solid #1a56a0' : '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{editingId ? 'Editing Listing' : 'New Listing'}</h2>
            {editingId && <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#374151' }}>Photos (select multiple or add one at a time)</label>
            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p} alt="preview" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                    {imageFiles.length > 0 && (
                      <button onClick={() => removePreview(i)} style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 11, cursor: 'pointer', lineHeight: '20px', textAlign: 'center' }}>x</button>
                    )}
                    {i === 0 && <span style={{ position: 'absolute', bottom: 3, left: 3, background: '#1a56a0', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>Cover</span>}
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, border: '2px dashed #d1d5db', cursor: 'pointer', fontSize: 14, color: '#6b7280', background: '#f9fafb' }}>
              {previews.length > 0 ? 'Add more photos (' + imageFiles.length + ' selected)' : 'Upload photos from device'}
              <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {editingId && imageFiles.length === 0 && previews.length > 0 && (
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6, textAlign: 'center' }}>Existing photos kept — upload new ones to replace</p>
            )}
          </div>

          {inp('Title', 'title', 'text', 'e.g. Spacious 3 Bed House — Kirwan')}

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

          {inp('Street address', 'address', 'text', 'e.g. 14 Bandicoot Drive')}

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

          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Features</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {chk('Pet friendly', 'petFriendly')}
              {chk('Air conditioning', 'airCon')}
              {chk('Pool', 'pool')}
              {chk('Garage', 'garage')}
              {chk('Furnished', 'furnished')}
              {chk('Bills included', 'billsIncluded')}
            </div>
          </div>

          <div style={{ background: '#f0f7ff', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Contact (shown on listing)</p>
            {inp('Contact name', 'contactName', 'text', 'TSV Rentals')}
            {inp('Contact phone', 'contactPhone', 'text', '07 4700 0000')}
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          {success && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 10 }}>{success}</p>}

          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: 11, background: editingId ? '#16a34a' : '#1a56a0', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Listing'}
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Current Listings ({listings.length})</h2>
          {listings.map(l => (
            <div key={l.id} style={{ background: 'white', border: editingId === l.id ? '2px solid #1a56a0' : '1px solid #e5e7eb', borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
              {l.cover_image && <img src={l.cover_image} alt={l.title} style={{ width: '100%', height: 100, objectFit: 'cover' }} />}
              <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{l.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{l.suburb} — ${l.price}/wk — {l.bedrooms} bed</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(l)} style={{ background: '#e0f0ff', color: '#1a56a0', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                  <button onClick={() => deleteListing(l.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
          {listings.length === 0 && <p style={{ fontSize: 14, color: '#6b7280' }}>No listings yet.</p>}
        </div>
      </div>
    </div>
  );
}
