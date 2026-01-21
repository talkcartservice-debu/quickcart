'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
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
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '2rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: '400px' }}>
        Sorry, we couldn't find the page you're looking for.
      </p>
      <button 
        onClick={handleGoBack}
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
        Go Back
      </button>
    </div>
  );
}