'use client';

import { useEffect, useState } from 'react';

// Minimal error component that doesn't depend on any external contexts or styling systems
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  const handleTryAgain = () => {
    reset();
  };

  // Inline styles to avoid any dependency on CSS-in-JS systems
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const headingStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: '1rem',
    textAlign: 'center'
  };

  const subHeadingStyle = {
    fontSize: '1.25rem',
    color: '#6b7280',
    marginBottom: '2rem',
    textAlign: 'center'
  };

  const textStyle = {
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: '400px',
    marginBottom: '2rem',
    lineHeight: '1.5'
  };

  const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>500</h1>
      <h2 style={subHeadingStyle}>Something went wrong</h2>
      <p style={textStyle}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={handleTryAgain}
        style={isHovered ? buttonHoverStyle : buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Try Again
      </button>
    </div>
  );
}