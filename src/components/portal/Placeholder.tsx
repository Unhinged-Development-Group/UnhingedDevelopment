export default function Placeholder({ section, description }: { section: string; description: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-ink-800">
        <span className="text-xl text-zinc-600">⌛</span>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-zinc-200">{section}</h2>
      <p className="max-w-xs text-sm text-zinc-600">{description}</p>
      <span className="mt-4 rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-700">Coming soon</span>
    </div>
  );
}
