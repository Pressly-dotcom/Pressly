"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      router.push("/settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-20">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Créer mon profil</h1>
        <p className="text-sm text-ink-muted">
          Rejoignez Pressly et personnalisez votre revue de presse.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-accent bg-accent/5 border border-accent/20 rounded px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">
            Nom
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Valentin"
            className="w-full px-4 py-3 bg-paper border border-ink/15 rounded text-sm text-ink placeholder:text-ink-muted/50 focus:border-ink transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="valentin@gmail.com"
            className="w-full px-4 py-3 bg-paper border border-ink/15 rounded text-sm text-ink placeholder:text-ink-muted/50 focus:border-ink transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            className="w-full px-4 py-3 bg-paper border border-ink/15 rounded text-sm text-ink placeholder:text-ink-muted/50 focus:border-ink transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-paper py-3 rounded text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Créer mon profil
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
