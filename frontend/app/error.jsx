'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#dc2626' }}>500</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Something went wrong</p>
      <button
        onClick={reset}
        style={{ padding: '10px 24px', backgroundColor: '#ea580c', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
