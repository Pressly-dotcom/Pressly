"use client";

import { DEFAULT_TOPICS, SUGGESTED_TOPICS, type Topic } from "@/lib/mock-data";
import { X } from "lucide-react";

interface TopicTagProps {
  topicId: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: "sm" | "md";
  customTopics?: Topic[];
}

export default function TopicTag({ topicId, selected, onClick, onRemove, size = "sm", customTopics = [] }: TopicTagProps) {
  const topic =
    DEFAULT_TOPICS.find((t) => t.id === topicId) ??
    SUGGESTED_TOPICS.find((t) => t.id === topicId) ??
    customTopics.find((t) => t.id === topicId);
  if (!topic) return null;

  const isSmall = size === "sm";

  const colors = selected
    ? "bg-ink text-paper"
    : "bg-cream text-ink-muted hover:bg-ink/10";

  if (onRemove && selected) {
    return (
      <span className={`inline-flex items-stretch rounded-lg overflow-hidden ${isSmall ? "text-xs" : "text-sm"}`}>
        <button
          type="button"
          onClick={onClick}
          className={`inline-flex items-center gap-1.5 font-medium bg-ink text-paper transition-colors ${
            isSmall ? "px-2.5 py-1.5" : "px-4 py-2"
          } cursor-pointer`}
        >
          <span>{topic.icon}</span>
          <span>{topic.label}</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className={`inline-flex items-center justify-center bg-ink-light text-paper/70 hover:text-paper hover:bg-accent transition-colors ${
            isSmall ? "px-1.5" : "px-2.5"
          }`}
          title="Supprimer ce thème"
        >
          <X size={isSmall ? 12 : 14} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
        isSmall ? "text-xs px-2.5 py-1.5 rounded" : "text-sm px-4 py-2 rounded-lg"
      } ${colors} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <span>{topic.icon}</span>
      <span>{topic.label}</span>
    </button>
  );
}
