"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User, LayoutDashboard, Settings } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            Pressly
          </span>
          <span className="hidden sm:inline text-[10px] font-body font-medium tracking-[0.2em] uppercase text-ink-muted border border-ink/15 px-2 py-0.5 rounded">
            Édition
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors px-3 py-2"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors px-3 py-2"
              >
                <Settings size={16} />
                Paramètres
              </Link>

              {/* Mobile menu */}
              <div className="relative sm:hidden">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-cream text-ink-muted hover:text-ink transition-colors"
                >
                  <User size={18} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 bg-paper border border-ink/10 rounded-lg shadow-lg py-1 w-48 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings size={15} />
                      Paramètres
                    </Link>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-accent hover:bg-cream transition-colors w-full text-left"
                    >
                      <LogOut size={15} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-ink/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ink text-paper text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="text-ink-muted hover:text-accent transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink-muted hover:text-ink transition-colors px-4 py-2"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-ink text-paper px-5 py-2 rounded hover:bg-ink-light transition-colors"
              >
                Créer mon profil
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
