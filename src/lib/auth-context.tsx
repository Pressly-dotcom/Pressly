"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { TopicId, Topic } from "./mock-data";
import { createClient } from "./supabase/client";

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

// Map DB row (snake_case) to frontend User (camelCase)
function mapProfileToUser(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    name: profile.name as string,
    email: profile.email as string,
    topics: (profile.topics as TopicId[]) ?? [],
    customTopics: (profile.custom_topics as Topic[]) ?? [],
    newsletter: {
      enabled: (profile.newsletter_enabled as boolean) ?? false,
      email: (profile.newsletter_email as string) ?? (profile.email as string),
    },
    createdAt: profile.created_at as string,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useRef(createClient()).current;

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setUser(null);
      return;
    }

    setUser(mapProfileToUser(data));
  }, [supabase]);

  // Listen for auth state changes
  useEffect(() => {
    // Check initial session with timeout
    const timeout = setTimeout(() => setIsLoading(false), 3000);

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      clearTimeout(timeout);
      if (authUser) {
        fetchProfile(authUser.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      clearTimeout(timeout);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await fetchProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  // Persist updates to Supabase
  const persistToDb = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!user) return;
      await supabase.from("profiles").update(updates).eq("id", user.id);
    },
    [user, supabase]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },
    [supabase]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw new Error(error.message);
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  }, [supabase]);

  const updateTopics = useCallback(
    (topics: TopicId[]) => {
      if (!user) return;
      setUser({ ...user, topics });
      persistToDb({ topics });
    },
    [user, persistToDb]
  );

  const updateProfile = useCallback(
    (name: string, email: string) => {
      if (!user) return;
      setUser({ ...user, name, email });
      persistToDb({ name, email });
    },
    [user, persistToDb]
  );

  const addCustomTopic = useCallback(
    (topic: Topic) => {
      if (!user) return;
      const exists = user.customTopics.some((t) => t.id === topic.id);
      if (exists) return;
      const customTopics = [...user.customTopics, { ...topic, isCustom: true }];
      const topics = [...user.topics, topic.id];
      setUser({ ...user, customTopics, topics });
      persistToDb({ custom_topics: customTopics, topics });
    },
    [user, persistToDb]
  );

  const removeCustomTopic = useCallback(
    (topicId: string) => {
      if (!user) return;
      const customTopics = user.customTopics.filter((t) => t.id !== topicId);
      const topics = user.topics.filter((t) => t !== topicId);
      setUser({ ...user, customTopics, topics });
      persistToDb({ custom_topics: customTopics, topics });
    },
    [user, persistToDb]
  );

  const updateNewsletter = useCallback(
    (enabled: boolean, email?: string) => {
      if (!user) return;
      const newsletter: Newsletter = {
        enabled,
        email: email ?? user.newsletter?.email ?? user.email,
      };
      setUser({ ...user, newsletter });
      persistToDb({ newsletter_enabled: newsletter.enabled, newsletter_email: newsletter.email });
    },
    [user, persistToDb]
  );

  const saveAll = useCallback(
    (updates: { name?: string; email?: string; topics?: TopicId[]; newsletter?: Newsletter }) => {
      if (!user) return;
      setUser({ ...user, ...updates });
      // Map to DB columns
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.topics !== undefined) dbUpdates.topics = updates.topics;
      if (updates.newsletter !== undefined) {
        dbUpdates.newsletter_enabled = updates.newsletter.enabled;
        dbUpdates.newsletter_email = updates.newsletter.email;
      }
      persistToDb(dbUpdates);
    },
    [user, persistToDb]
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
