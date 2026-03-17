"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Newspaper, Sparkles, UserCircle } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-accent">
              Édition du jour
            </span>
            <span className="w-8 h-px bg-accent"></span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-ink leading-[1.1] mb-6">
            Votre presse,<br />
            <span className="italic text-accent">sur mesure.</span>
          </h1>
          <p className="text-lg text-ink-muted leading-relaxed mb-10 max-w-lg font-light">
            Pressly génère chaque jour une revue de presse personnalisée grâce à
            l&apos;intelligence artificielle, adaptée à vos centres d&apos;intérêt.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-ink text-paper px-7 py-3 text-sm font-medium rounded hover:bg-ink-light transition-colors"
              >
                Mon Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-7 py-3 text-sm font-medium rounded hover:bg-ink-light transition-colors"
                >
                  Commencer
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border border-ink/20 text-ink px-7 py-3 text-sm font-medium rounded hover:bg-cream transition-colors"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-ink/10"></div>
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="w-10 h-10 rounded bg-cream flex items-center justify-center mb-4">
              <UserCircle size={20} className="text-ink" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Profil personnalisé</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Choisissez vos thèmes et sujets d&apos;intérêt. Pressly adapte
              votre fil d&apos;actualité en conséquence.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded bg-cream flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-ink" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Résumés par IA</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Chaque article est synthétisé par notre intelligence artificielle
              pour une lecture rapide et efficace.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded bg-cream flex items-center justify-center mb-4">
              <Newspaper size={20} className="text-ink" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Édition quotidienne</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Retrouvez chaque matin votre revue de presse des dernières 24h,
              comme un journal papier haut de gamme.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-paper mb-4">
            Prêt à lire autrement ?
          </h2>
          <p className="text-paper/60 mb-8 max-w-md mx-auto text-sm">
            Rejoignez Pressly et recevez chaque jour une revue de presse
            taillée pour vous.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 bg-accent text-paper px-8 py-3 text-sm font-medium rounded hover:bg-accent/90 transition-colors"
          >
            {user ? "Accéder au dashboard" : "Créer mon profil gratuitement"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
