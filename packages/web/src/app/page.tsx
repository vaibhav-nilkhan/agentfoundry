export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8">
          Agent<span className="text-primary">Foundry</span>
        </h1>
        <p className="text-2xl text-center text-muted-foreground mb-12">
          The GitHub + App Store for AI Agents
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Build</h3>
            <p className="text-muted-foreground">
              Create portable AI Skills with our SDK and CLI tools
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Validate</h3>
            <p className="text-muted-foreground">
              Automated verification for safety, permissions, and compliance
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Publish</h3>
            <p className="text-muted-foreground">
              Share and monetize verified Skills in our global marketplace
            </p>
          </div>
        </div>
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Coming Soon • MVP in Development
          </p>
        </div>
      </div>
    </main>
  );
}
