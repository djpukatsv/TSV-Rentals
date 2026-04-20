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
        <span style={{ fontSize: 20 }}>🏠</span>
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
