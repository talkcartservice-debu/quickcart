'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleTryAgain = () => {
    reset();
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f3f4f6'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
        500
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '2rem' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: '400px' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button 
        onClick={handleTryAgain}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Try Again
      </button>
    </div>
  );
}