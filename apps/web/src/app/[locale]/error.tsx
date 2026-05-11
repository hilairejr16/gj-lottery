'use client';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#f59e0b', marginBottom: '16px' }}>⚠️ Error Details (debug)</h1>
      <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '8px' }}>{error.message}</p>
      {error.digest && <p style={{ color: '#6b7280', marginBottom: '16px' }}>Digest: {error.digest}</p>}
      <pre style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', overflow: 'auto', fontSize: '12px', color: '#d1d5db' }}>
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: '24px', padding: '8px 16px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
