'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('NEXORA workspace error', error);
  }, [error]);

  return (
    <main className="app-error">
      <div className="error-card">
        <div className="error-code">NEXORA / ERROR</div>
        <h1>We could not load this workspace.</h1>
        <p>The application hit an unexpected error. Your data was not intentionally changed.</p>
        <button onClick={() => reset()}>Try again <span>→</span></button>
      </div>
    </main>
  );
}
