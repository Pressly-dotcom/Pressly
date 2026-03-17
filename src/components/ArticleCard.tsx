"use client";

import type { Article, Topic } from "@/lib/mock-data";
import { DEFAULT_TOPICS, SUGGESTED_TOPICS, timeAgo } from "@/lib/mock-data";
import { Clock, ExternalLink } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "headline";
  customTopics?: Topic[];
}

function findTopic(topicId: string, customTopics: Topic[] = []) {
  return (
    DEFAULT_TOPICS.find((t) => t.id === topicId) ??
    SUGGESTED_TOPICS.find((t) => t.id === topicId) ??
    customTopics.find((t) => t.id === topicId)
  );
}

export default function ArticleCard({ article, variant = "default", customTopics = [] }: ArticleCardProps) {
  const topic = findTopic(article.topic, customTopics);

  if (variant === "headline") {
    return (
      <article className="group bg-paper border border-ink/10 rounded-lg hover:border-ink/25 transition-all hover:shadow-sm">
        <a href={article.url} className="block p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            {topic && (
              <span className="text-xs font-medium bg-accent/10 text-accent px-2.5 py-0.5 rounded">
                {topic.icon} {topic.label}
              </span>
            )}
            <span className="text-xs text-ink-muted">À la une</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink leading-snug mb-2 sm:mb-3 group-hover:text-accent transition-colors">
            {article.title}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3 sm:mb-4 line-clamp-3">{article.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-ink-muted flex-wrap">
              <span className="font-medium text-ink-light">{article.source}</span>
              <span className="hidden sm:inline">·</span>
              <span>{timeAgo(article.publishedAt)}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:flex items-center gap-1">
                <Clock size={12} />
                {article.readTime} min
              </span>
            </div>
            <ExternalLink size={15} className="text-ink-muted/40 group-hover:text-accent transition-colors flex-shrink-0" />
          </div>
        </a>
      </article>
    );
  }

  return (
    <article className="group border-b border-ink/5 last:border-0 hover:bg-cream/50 -mx-3 rounded transition-colors">
      <a href={article.url} className="flex gap-3 sm:gap-4 py-3 sm:py-4 px-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {topic && (
              <span className="text-[11px] font-medium text-ink-muted">
                {topic.icon} {topic.label}
              </span>
            )}
            <span className="text-[11px] text-ink-muted/60">{timeAgo(article.publishedAt)}</span>
          </div>
          <h3 className="text-sm font-semibold text-ink leading-snug mb-1 group-hover:text-accent transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{article.summary}</p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-ink-muted">
            <span className="font-medium">{article.source}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {article.readTime} min
            </span>
          </div>
        </div>
        <ExternalLink size={14} className="flex-shrink-0 self-center text-ink-muted/30 group-hover:text-accent transition-colors" />
      </a>
    </article>
  );
}
