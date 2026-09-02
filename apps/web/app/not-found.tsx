export default function NotFound() {
  return (
    <main className="app-error">
      <div className="error-card">
        <div className="error-code">NEXORA / 404</div>
        <h1>This workspace route does not exist.</h1>
        <p>The requested resource could not be found.</p>
        <a href="/">Return to overview <span>→</span></a>
      </div>
    </main>
  );
}
