"use client";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-5xl mb-4">🥃</p>
      <h1 className="text-xl font-bold text-oak mb-2">Без интернет</h1>
      <p className="text-sm text-walnut mb-8">
        Провери връзката си и опитай отново.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-walnut px-6 py-3 text-sm font-semibold text-cream"
      >
        Опитай отново
      </button>
    </main>
  );
}
