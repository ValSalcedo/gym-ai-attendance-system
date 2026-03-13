import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#111111',
        color: '#f5f5f5',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#1b1b1b',
          border: '1px solid #2a2a2a',
          borderRadius: '18px',
          padding: '24px',
        }}
      >
        <h1 style={{ marginBottom: '10px' }}>Double Alpha Gym</h1>
        <p style={{ color: '#a0a0a0', marginBottom: '20px' }}>
          Admin Login
        </p>

        <input
          type="text"
          placeholder="Email"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '10px',
            border: '1px solid #2a2a2a',
            background: '#151515',
            color: '#fff',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: '1px solid #2a2a2a',
            background: '#151515',
            color: '#fff',
          }}
        />

        <button
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: '#d62828',
            color: '#fff',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '14px',
          }}
        >
          Sign In
        </button>

        <Link to="/dashboard" style={{ color: '#f4a300' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}