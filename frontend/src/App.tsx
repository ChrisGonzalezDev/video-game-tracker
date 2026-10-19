function App() {
  return (
    <main className="page">
      <section className="welcome" aria-labelledby="page-title">
        <p className="eyebrow">Your collection, in one place</p>
        <h1 id="page-title">Video Game Inventory Tracker</h1>
        <p className="description">
          Your collection workspace is ready. Game tracking features are coming
          soon.
        </p>
        <span className="status">
          <span className="status-dot" aria-hidden="true" />
          Frontend is running
        </span>
      </section>
    </main>
  );
}

export default App;
