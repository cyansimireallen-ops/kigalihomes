export default function StaticPage({ title, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-charcoal">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">{children}</div>
    </div>
  );
}
