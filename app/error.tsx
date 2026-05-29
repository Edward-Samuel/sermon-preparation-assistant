'use client'

import React, { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (error) console.error(error)
  }, [error])

  return (
    <div className="error-container" style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Something went wrong</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        An unexpected error occurred. Please try again.
      </p>
      {error?.message && (
        <pre style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--color-danger)', marginBottom: '1.5rem', overflow: 'auto' }}>
          {error.message}
        </pre>
      )}
      <button
        onClick={reset}
        style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
      >
        Try again
      </button>
    </div>
  )
}
