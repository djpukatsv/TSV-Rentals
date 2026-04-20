import { useState } from 'react';

export default function AuthPage({ login, navigate }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      login(data.user, data.token);
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 36 }}>🏠</span>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>
            {mode === 'login' ? 'Sign in to TSV Rentals' : 'Create an account'}
          </h2>
        </div>

        {mode === 'register' && (
          <>
            <div className="form-group">
              <label>Full name</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Smith" />
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="04xx xxx xxx" />
            </div>
            <div className="form-group">
              <label>I am a</label>
              <select value={form.role} onChange={e => update('role', e.target.value)}>
                <option value="user">Renter</option>
                <option value="landlord">Private Landlord</option>
                <option value="agent">Real Estate Agent</option>
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" />
        </div>

        {error && <p className="error" style={{ marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '11px', fontSize: 15, marginBottom: 16 }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ color: '#1a56a0', cursor: 'pointer', fontWeight: 500 }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}
