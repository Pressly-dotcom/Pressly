export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-ink">Pressly</span>
          <span className="text-ink-muted text-xs">© {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs text-ink-muted">
          Votre revue de presse personnalisée, générée par l&apos;IA.
        </p>
      </div>
    </footer>
  );
}
