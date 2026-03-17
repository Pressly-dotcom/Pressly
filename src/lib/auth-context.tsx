"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { TopicId, Topic } from "./mock-data";

interface Newsletter {
  enabled: boolean;
  email: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  topics: TopicId[];
  customTopics: Topic[];
  newsletter: Newsletter;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateTopics: (topics: TopicId[]) => void;
  updateProfile: (name: string, email: string) => void;
  addCustomTopic: (topic: Topic) => void;
  removeCustomTopic: (topicId: string) => void;
  updateNewsletter: (enabled: boolean, email?: string) => void;
  saveAll: (updates: { name?: string; email?: string; topics?: TopicId[]; newsletter?: Newsletter }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "pressly_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migrations
        if (!parsed.customTopics) parsed.customTopics = [];
        if (!parsed.newsletter) parsed.newsletter = { enabled: false, email: parsed.email ?? "" };
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const login = useCallback(
    async (email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 600));
      // Restore existing user data if same email
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const existing = JSON.parse(stored);
          if (existing.email === email) {
            if (!existing.customTopics) existing.customTopics = [];
            if (!existing.newsletter) existing.newsletter = { enabled: false, email };
            persist(existing);
            return;
          }
        } catch { /* ignore */ }
      }
      const u: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        topics: ["tech", "ia", "finance"],
        customTopics: [],
        newsletter: { enabled: false, email },
        createdAt: new Date().toISOString(),
      };
      persist(u);
    },
    [persist]
  );

  const signup = useCallback(
    async (name: string, email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 600));
      const u: User = {
        id: "1",
        name,
        email,
        topics: [],
        customTopics: [],
        newsletter: { enabled: false, email },
        createdAt: new Date().toISOString(),
      };
      persist(u);
    },
    [persist]
  );

  const logout = useCallback(() => {
    setUser(null);
    // Keep localStorage so user data persists across login/logout
  }, []);

  const updateTopics = useCallback(
    (topics: TopicId[]) => {
      if (!user) return;
      persist({ ...user, topics });
    },
    [user, persist]
  );

  const updateProfile = useCallback(
    (name: string, email: string) => {
      if (!user) return;
      persist({ ...user, name, email });
    },
    [user, persist]
  );

  const addCustomTopic = useCallback(
    (topic: Topic) => {
      if (!user) return;
      const exists = user.customTopics.some((t) => t.id === topic.id);
      if (exists) return;
      const customTopics = [...user.customTopics, { ...topic, isCustom: true }];
      const topics = [...user.topics, topic.id];
      persist({ ...user, customTopics, topics });
    },
    [user, persist]
  );

  const removeCustomTopic = useCallback(
    (topicId: string) => {
      if (!user) return;
      const customTopics = user.customTopics.filter((t) => t.id !== topicId);
      const topics = user.topics.filter((t) => t !== topicId);
      persist({ ...user, customTopics, topics });
    },
    [user, persist]
  );

  const updateNewsletter = useCallback(
    (enabled: boolean, email?: string) => {
      if (!user) return;
      const newsletter: Newsletter = {
        enabled,
        email: email ?? user.newsletter?.email ?? user.email,
      };
      persist({ ...user, newsletter });
    },
    [user, persist]
  );

  const saveAll = useCallback(
    (updates: { name?: string; email?: string; topics?: TopicId[]; newsletter?: Newsletter }) => {
      if (!user) return;
      persist({ ...user, ...updates });
    },
    [user, persist]
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateTopics, updateProfile, addCustomTopic, removeCustomTopic, updateNewsletter, saveAll }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
