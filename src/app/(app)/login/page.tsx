"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-20">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Se connecter</h1>
        <p className="text-sm text-ink-muted">
          Retrouvez votre revue de presse personnalisée.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-accent bg-accent/5 border border-accent/20 rounded px-4 py-3">
            {error}
          </div>
        )}

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
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-paper border border-ink/15 rounded text-sm text-ink placeholder:text-ink-muted/50 focus:border-ink transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper py-3 rounded text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Se connecter
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-accent font-medium hover:underline">
          Créer mon profil
        </Link>
      </p>
    </div>
  );
}
