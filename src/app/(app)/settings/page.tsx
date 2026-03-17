"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DEFAULT_TOPICS, SUGGESTED_TOPICS, type Topic, type TopicId } from "@/lib/mock-data";
import TopicTag from "@/components/TopicTag";
import { Check, Loader2, Search, Plus } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, updateTopics, updateProfile, addCustomTopic, removeCustomTopic, updateNewsletter, saveAll } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setSelectedTopics(user.topics);
      setName(user.name);
      setEmail(user.email);
      setNewsletterEmail(user.newsletter?.email || user.email);
      setNewsletterEnabled(user.newsletter?.enabled ?? false);
    }
  }, [user, isLoading, router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allKnownTopics = useMemo(() => {
    const custom = user?.customTopics ?? [];
    return [...DEFAULT_TOPICS, ...SUGGESTED_TOPICS, ...custom];
  }, [user]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    // Filter from suggested + default topics that aren't already selected
    return [...DEFAULT_TOPICS, ...SUGGESTED_TOPICS, ...(user?.customTopics ?? [])]
      .filter(
        (t) =>
          t.label.toLowerCase().includes(q) &&
          !selectedTopics.includes(t.id)
      )
      .slice(0, 6);
  }, [search, selectedTopics, user?.customTopics]);

  // Check if search matches nothing known — allow creating custom
  const canCreateCustom = useMemo(() => {
    if (!search.trim() || search.trim().length < 2) return false;
    const q = search.toLowerCase().trim();
    const alreadyExists = allKnownTopics.some(
      (t) => t.label.toLowerCase() === q || t.id === q
    );
    const alreadySelected = selectedTopics.includes(q.replace(/\s+/g, "-"));
    return !alreadyExists && !alreadySelected;
  }, [search, allKnownTopics, selectedTopics]);

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

  const toggleTopic = (id: TopicId) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const handleAddSuggested = (topic: Topic) => {
    // If it's a suggested topic (not in DEFAULT_TOPICS), add as custom
    const isDefault = DEFAULT_TOPICS.some((t) => t.id === topic.id);
    if (!isDefault) {
      addCustomTopic(topic);
    }
    setSelectedTopics((prev) => (prev.includes(topic.id) ? prev : [...prev, topic.id]));
    setSearch("");
    setShowDropdown(false);
    setSaved(false);
  };

  const handleCreateCustom = () => {
    const label = search.trim();
    const id = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const custom: Topic = { id, label, icon: "📌", isCustom: true };
    addCustomTopic(custom);
    setSelectedTopics((prev) => [...prev, id]);
    setSearch("");
    setShowDropdown(false);
    setSaved(false);
  };

  const handleRemoveCustom = (topicId: string) => {
    removeCustomTopic(topicId);
    setSelectedTopics((prev) => prev.filter((t) => t !== topicId));
    setSaved(false);
  };

  const handleSave = () => {
    saveAll({
      name,
      email,
      topics: selectedTopics,
      newsletter: {
        enabled: newsletterEnabled,
        email: newsletterEmail,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Paramètres</h1>
        <p className="text-sm text-ink-muted">
          Personnalisez votre profil et vos préférences de lecture.
        </p>
      </div>

      {/* Profile section */}
      <section className="mb-12">
        <h2 className="font-display text-lg font-semibold text-ink mb-5 pb-2 border-b border-ink/10">
          Mon profil
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              className="w-full px-4 py-3 bg-paper border border-ink/15 rounded text-sm text-ink focus:border-ink transition-colors"
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
              onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
              className="w-full px-4 py-3 bg-paper border border-ink/15 rounded text-sm text-ink focus:border-ink transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Topics section */}
      <section className="mb-12">
        <h2 className="font-display text-lg font-semibold text-ink mb-2 pb-2 border-b border-ink/10">
          Mes thèmes
        </h2>
        <p className="text-sm text-ink-muted mb-5">
          Sélectionnez les sujets qui vous intéressent ou ajoutez les vôtres.
        </p>

        {/* Search bar */}
        <div ref={searchRef} className="relative mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Rechercher ou ajouter un thème..."
              className="w-full pl-10 pr-4 py-3 bg-paper border border-ink/15 rounded-lg text-sm text-ink placeholder:text-ink-muted/50 focus:border-ink transition-colors"
            />
          </div>

          {/* Dropdown */}
          {showDropdown && (search.trim().length >= 1) && (searchResults.length > 0 || canCreateCustom) && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-paper border border-ink/15 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleAddSuggested(topic)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-cream transition-colors"
                >
                  <span className="text-base">{topic.icon}</span>
                  <span className="font-medium text-ink">{topic.label}</span>
                  <Plus size={14} className="ml-auto text-ink-muted" />
                </button>
              ))}
              {canCreateCustom && (
                <button
                  type="button"
                  onClick={handleCreateCustom}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-cream transition-colors border-t border-ink/5"
                >
                  <span className="text-base">📌</span>
                  <span className="text-ink">
                    Créer le thème <strong>&ldquo;{search.trim()}&rdquo;</strong>
                  </span>
                  <Plus size={14} className="ml-auto text-accent" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Default topics */}
        <div className="flex flex-wrap gap-2.5">
          {DEFAULT_TOPICS.map((topic) => (
            <TopicTag
              key={topic.id}
              topicId={topic.id}
              selected={selectedTopics.includes(topic.id)}
              onClick={() => toggleTopic(topic.id)}
              size="md"
              customTopics={user.customTopics}
            />
          ))}
        </div>

        {/* Custom topics */}
        {user.customTopics.length > 0 && (
          <div className="mt-5 pt-4 border-t border-ink/5">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">
              Mes thèmes personnalisés
            </p>
            <div className="flex flex-wrap gap-2.5">
              {user.customTopics.map((topic) => (
                <TopicTag
                  key={topic.id}
                  topicId={topic.id}
                  selected={selectedTopics.includes(topic.id)}
                  onClick={() => toggleTopic(topic.id)}
                  onRemove={() => handleRemoveCustom(topic.id)}
                  size="md"
                  customTopics={user.customTopics}
                />
              ))}
            </div>
          </div>
        )}

        {selectedTopics.length > 0 && (
          <p className="mt-4 text-xs text-ink-muted">
            {selectedTopics.length} thème{selectedTopics.length > 1 ? "s" : ""} sélectionné{selectedTopics.length > 1 ? "s" : ""}
          </p>
        )}
      </section>

      {/* Newsletter section */}
      <section className="mb-12">
        <h2 className="font-display text-lg font-semibold text-ink mb-2 pb-2 border-b border-ink/10">
          Newsletter
        </h2>
        <p className="text-sm text-ink-muted mb-5">
          Recevez votre revue de presse personnalisée chaque matin à 9h directement par email.
        </p>

        <div className="bg-cream rounded-xl p-5 space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Activer la newsletter quotidienne</p>
              <p className="text-xs text-ink-muted mt-0.5">Envoi automatique chaque matin à 9h</p>
            </div>
            <button
              type="button"
              onClick={() => { setNewsletterEnabled(!newsletterEnabled); setSaved(false); }}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                newsletterEnabled ? "bg-accent" : "bg-ink/20"
              }`}
            >
              <span className={`absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                newsletterEnabled ? "translate-x-[22px]" : "translate-x-[2px]"
              }`} />
            </button>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">
              Email de réception
            </label>
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => { setNewsletterEmail(e.target.value); setSaved(false); }}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 bg-paper border border-ink/15 rounded text-sm text-ink focus:border-ink transition-colors"
            />
          </div>

          {newsletterEnabled && (
            <p className="text-xs text-accent font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              Newsletter activée — prochain envoi demain à 9h
            </p>
          )}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="bg-ink text-paper px-8 py-3 rounded text-sm font-medium hover:bg-ink-light transition-colors flex items-center gap-2"
        >
          {saved && <Check size={16} />}
          {saved ? "Enregistré" : "Enregistrer"}
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          Aller au dashboard →
        </button>
      </div>
    </div>
  );
}
