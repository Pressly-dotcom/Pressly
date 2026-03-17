"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DEFAULT_TOPICS, SUGGESTED_TOPICS, getArticlesForTopics, type TopicId, type Article } from "@/lib/mock-data";
import ArticleCard from "@/components/ArticleCard";
import { Loader2, Settings, RefreshCw, Newspaper, WifiOff, Mail, Send, Check } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, updateNewsletter } = useAuth();
  const [activeFilter, setActiveFilter] = useState<TopicId | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [liveArticles, setLiveArticles] = useState<Article[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const fetchNews = useCallback(async () => {
    if (!user || user.topics.length === 0) return;
    setIsFetching(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams({
        topics: user.topics.join(","),
        customTopics: JSON.stringify(user.customTopics ?? []),
      });
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();

      if (data.error === "NO_API_KEY") {
        setLiveArticles(null);
        setFetchError(true);
      } else if (data.articles.length === 0) {
        setLiveArticles(null);
      } else {
        // Check which topics got live results
        const liveTopics = new Set(data.articles.map((a: Article) => a.topic));
        const missingTopics = user.topics.filter((t) => !liveTopics.has(t));

        if (missingTopics.length > 0) {
          // Fill in mock articles for topics the API didn't cover
          const mockFill = getArticlesForTopics(missingTopics, user.customTopics ?? []);
          setLiveArticles([...data.articles, ...mockFill]);
        } else {
          setLiveArticles(data.articles);
        }
      }
    } catch {
      setLiveArticles(null);
      setFetchError(true);
    } finally {
      setIsFetching(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch on mount and when topics change
  useEffect(() => {
    if (user && user.topics.length > 0) {
      fetchNews();
    }
  }, [user?.topics.join(","), fetchNews]);

  const mockArticles = useMemo(() => {
    if (!user) return [];
    return getArticlesForTopics(user.topics, user.customTopics ?? []);
  }, [user]);

  const userArticles = liveArticles ?? mockArticles;

  const filteredArticles = useMemo(() => {
    if (activeFilter === "all") return userArticles;
    return userArticles.filter((a) => a.topic === activeFilter);
  }, [userArticles, activeFilter]);

  const headlines = filteredArticles.filter((a) => a.isHeadline);
  const regular = filteredArticles.filter((a) => !a.isHeadline);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const sendNewsletterNow = async () => {
    if (!user) return;
    setSendingNewsletter(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterSent(true);
        setTimeout(() => setNewsletterSent(false), 3000);
      }
    } catch {
      // silent fail
    } finally {
      setSendingNewsletter(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-ink-muted" size={24} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const allTopics = [...DEFAULT_TOPICS, ...SUGGESTED_TOPICS, ...(user.customTopics ?? [])];
  const userTopics = allTopics.filter((t) => user.topics.includes(t.id));
  // Deduplicate
  const seenIds = new Set<string>();
  const uniqueUserTopics = userTopics.filter((t) => {
    if (seenIds.has(t.id)) return false;
    seenIds.add(t.id);
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-accent mb-2">
            {dateStr}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            Bonjour, {user.name}.
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {liveArticles ? "Articles en temps réel." : "Votre revue de presse des dernières 24h."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors border border-ink/15 px-3 py-2 rounded disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing || isFetching ? "animate-spin" : ""} />
            Actualiser
          </button>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors border border-ink/15 px-3 py-2 rounded"
          >
            <Settings size={13} />
            Thèmes
          </Link>
        </div>
      </div>

      {/* API key notice */}
      {fetchError && !liveArticles && (
        <div className="flex items-center gap-3 bg-cream border border-ink/10 rounded-lg px-4 py-3 mb-6">
          <WifiOff size={16} className="text-ink-muted flex-shrink-0" />
          <p className="text-xs text-ink-muted">
            <span className="font-medium text-ink">Mode démo</span> — Ajoutez votre clé API GNews dans <code className="bg-ink/5 px-1.5 py-0.5 rounded text-[11px]">.env.local</code> pour afficher de vrais articles. Clé gratuite sur gnews.io.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isFetching && !liveArticles && userArticles.length === 0 && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <Loader2 className="animate-spin text-ink-muted mx-auto mb-3" size={24} />
            <p className="text-sm text-ink-muted">Chargement des articles...</p>
          </div>
        </div>
      )}

      {/* No topics */}
      {user.topics.length === 0 && (
        <div className="bg-cream rounded-lg p-10 text-center">
          <Newspaper size={32} className="text-ink-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">
            Personnalisez votre revue
          </h2>
          <p className="text-sm text-ink-muted mb-6 max-w-md mx-auto">
            Sélectionnez vos thèmes d&apos;intérêt pour recevoir des articles adaptés à vos goûts.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-2.5 rounded text-sm font-medium hover:bg-ink-light transition-colors"
          >
            <Settings size={15} />
            Choisir mes thèmes
          </Link>
        </div>
      )}

      {user.topics.length > 0 && userArticles.length > 0 && (
        <>
          {/* Topic filter */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`text-xs font-medium px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                activeFilter === "all"
                  ? "bg-ink text-paper"
                  : "bg-cream text-ink-muted hover:bg-ink/10"
              }`}
            >
              Tous ({userArticles.length})
            </button>
            {uniqueUserTopics.map((topic) => {
              const count = userArticles.filter((a) => a.topic === topic.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveFilter(topic.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                    activeFilter === topic.id
                      ? "bg-ink text-paper"
                      : "bg-cream text-ink-muted hover:bg-ink/10"
                  }`}
                >
                  {topic.icon} {topic.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-cream rounded-lg p-4">
              <p className="font-display text-2xl font-bold text-ink">{filteredArticles.length}</p>
              <p className="text-xs text-ink-muted mt-0.5">Articles</p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <p className="font-display text-2xl font-bold text-ink">{user.topics.length}</p>
              <p className="text-xs text-ink-muted mt-0.5">Thèmes suivis</p>
            </div>
            <div className="bg-cream rounded-lg p-4">
              <p className="font-display text-2xl font-bold text-ink">
                {filteredArticles.reduce((s, a) => s + a.readTime, 0)}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">Min de lecture</p>
            </div>
          </div>

          {/* Newsletter card */}
          <div className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border px-5 py-4 mb-8 transition-colors ${
            user.newsletter?.enabled
              ? "bg-ink text-paper border-ink"
              : "bg-cream border-ink/10"
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                user.newsletter?.enabled ? "bg-white/10" : "bg-ink/5"
              }`}>
                <Mail size={16} className={user.newsletter?.enabled ? "text-paper" : "text-ink-muted"} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${user.newsletter?.enabled ? "text-paper" : "text-ink"}`}>
                  Newsletter quotidienne
                </p>
                <p className={`text-xs truncate ${user.newsletter?.enabled ? "text-paper/60" : "text-ink-muted"}`}>
                  {user.newsletter?.enabled
                    ? `Envoyée à 9h · ${user.newsletter.email || user.email}`
                    : "Recevez votre revue chaque matin à 9h"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {user.newsletter?.enabled && (
                <button
                  onClick={sendNewsletterNow}
                  disabled={sendingNewsletter || newsletterSent}
                  className="flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-paper px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                >
                  {newsletterSent
                    ? <><Check size={12} /> Envoyé !</>
                    : sendingNewsletter
                    ? <><Loader2 size={12} className="animate-spin" /> Envoi…</>
                    : <><Send size={12} /> Envoyer maintenant</>}
                </button>
              )}
              {/* Toggle */}
              <button
                onClick={() => updateNewsletter(!user.newsletter?.enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  user.newsletter?.enabled ? "bg-accent" : "bg-ink/20"
                }`}
              >
                <span className={`absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                  user.newsletter?.enabled ? "translate-x-[22px]" : "translate-x-[2px]"
                }`} />
              </button>
            </div>
          </div>

          {/* Headlines */}
          {headlines.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                À la une
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {headlines.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="headline" customTopics={user.customTopics ?? []} />
                ))}
              </div>
            </section>
          )}

          {/* Feed */}
          {regular.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-ink mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                Fil d&apos;actualité
              </h2>
              <div className="bg-paper border border-ink/5 rounded-lg px-3">
                {regular.map((article) => (
                  <ArticleCard key={article.id} article={article} customTopics={user.customTopics ?? []} />
                ))}
              </div>
            </section>
          )}

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-muted text-sm">Aucun article pour ce filtre.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
