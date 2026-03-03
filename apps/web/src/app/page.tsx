export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">My Pocket</h1>
        <p className="text-lg text-gray-600 mb-8">
          Personal Finance Management
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            API Status:{' '}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
