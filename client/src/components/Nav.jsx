export default function Nav({ user, navigate, logout }) {
  return (
    <nav style={{
      background: '#1a56a0',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div
        onClick={() => navigate('home')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 8, flexShrink: 0 }}>
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a9fe0" />
              <stop offset="65%" stopColor="#7ab8e8" />
              <stop offset="100%" stopColor="#5a9a4a" />
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="8" fill="url(#skyGrad)" />
          <polygon points="18,4 28,13 8,13" fill="white" />
          <rect x="21" y="6" width="3" height="5" fill="white" />
          <rect x="10" y="13" width="16" height="9" fill="white" />
          <rect x="16" y="17" width="4" height="5" fill="#4a9fe0" />
          <text x="18" y="29" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">TSV</text>
        </svg>
        <span style={{ color: 'white', fontSize: 17, fontWeight: 600 }}>
          TSV <span style={{ color: '#78b4f0' }}>Rentals</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => navigate('home')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 14,
            cursor: 'pointer',
            padding: '5px 8px'
          }}
        >
          Browse
        </button>

        {user ? (
          <>
            <button
              onClick={() => navigate('list-property')}
              style={{
                background: '#f59e0b',
                color: '#412402',
                border: 'none',
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + List Property
            </button>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              Hi, {user.name?.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('list-property')}
              style={{
                background: '#f59e0b',
                color: '#412402',
                border: 'none',
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + List Property
            </button>
            <button
              onClick={() => navigate('auth')}
              style={{
                background: 'white',
                color: '#1a56a0',
                border: 'none',
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
