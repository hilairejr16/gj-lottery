'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ padding: '40px', fontFamily: 'monospace', background: '#0a0a0a', color: '#fff', margin: 0 }}>
        <h1 style={{ color: '#f59e0b' }}>⚠️ Global Error (debug)</h1>
        <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error.message}</p>
        {error.digest && <p style={{ color: '#6b7280' }}>Digest: {error.digest}</p>}
        <pre style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', overflow: 'auto', fontSize: '12px' }}>
          {error.stack}
        </pre>
        <button onClick={reset} style={{ marginTop: '16px', padding: '8px 16px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Try again
        </button>
      </body>
    </html>
  );
}
