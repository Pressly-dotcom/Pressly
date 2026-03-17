export interface Topic {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
}

export const DEFAULT_TOPICS: Topic[] = [
  { id: "tech", label: "Tech", icon: "💻" },
  { id: "ia", label: "Intelligence Artificielle", icon: "🤖" },
  { id: "finance", label: "Finance", icon: "📊" },
  { id: "politique", label: "Politique", icon: "🏛️" },
  { id: "culture", label: "Culture", icon: "🎭" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "sport", label: "Sport", icon: "⚽" },
  { id: "environnement", label: "Environnement", icon: "🌍" },
  { id: "sante", label: "Santé", icon: "🏥" },
  { id: "economie", label: "Économie", icon: "💹" },
  { id: "startup", label: "Startups", icon: "🚀" },
  { id: "cyber", label: "Cybersécurité", icon: "🔒" },
];

// Searchable suggestions that appear when users type in the search bar
export const SUGGESTED_TOPICS: Topic[] = [
  { id: "immobilier", label: "Immobilier", icon: "🏠" },
  { id: "automobile", label: "Automobile", icon: "🚗" },
  { id: "mode", label: "Mode", icon: "👗" },
  { id: "gastronomie", label: "Gastronomie", icon: "🍽️" },
  { id: "voyage", label: "Voyage", icon: "✈️" },
  { id: "education", label: "Éducation", icon: "📚" },
  { id: "droit", label: "Droit & Justice", icon: "⚖️" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "musique", label: "Musique", icon: "🎵" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "crypto", label: "Crypto & Blockchain", icon: "🪙" },
  { id: "espace", label: "Espace", icon: "🛰️" },
  { id: "energie", label: "Énergie", icon: "⚡" },
  { id: "media", label: "Médias", icon: "📺" },
  { id: "emploi", label: "Emploi & RH", icon: "💼" },
  { id: "agriculture", label: "Agriculture", icon: "🌾" },
  { id: "defense", label: "Défense", icon: "🛡️" },
  { id: "cinema", label: "Cinéma", icon: "🎬" },
  { id: "litterature", label: "Littérature", icon: "📖" },
  { id: "philosophie", label: "Philosophie", icon: "🧠" },
];

export const TOPICS = DEFAULT_TOPICS;

export type TopicId = string;

export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  topic: TopicId;
  publishedAt: string;
  readTime: number;
  imageUrl?: string;
  url: string;
  isHeadline?: boolean;
}

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "OpenAI dévoile son nouveau modèle capable de raisonnement avancé",
    summary:
      "Le laboratoire américain a présenté un modèle d'IA qui surpasse les performances humaines sur plusieurs benchmarks de raisonnement scientifique et mathématique.",
    source: "Le Monde",
    topic: "ia",
    publishedAt: hoursAgo(1),
    readTime: 4,
    url: "#",
    isHeadline: true,
  },
  {
    id: "2",
    title: "La BCE maintient ses taux directeurs inchangés",
    summary:
      "Christine Lagarde a confirmé le statu quo monétaire, tout en signalant une possible baisse au prochain trimestre face au ralentissement économique.",
    source: "Les Échos",
    topic: "finance",
    publishedAt: hoursAgo(2),
    readTime: 3,
    url: "#",
  },
  {
    id: "3",
    title: "Apple lance son casque Vision Pro 2 en Europe",
    summary:
      "Le géant de Cupertino étend la disponibilité de son casque de réalité mixte avec un nouveau modèle plus léger et abordable.",
    source: "01net",
    topic: "tech",
    publishedAt: hoursAgo(3),
    readTime: 5,
    url: "#",
    isHeadline: true,
  },
  {
    id: "4",
    title: "Réforme des retraites : le Conseil constitutionnel rend sa décision",
    summary:
      "Les Sages ont validé l'essentiel du texte, rejetant deux cavaliers législatifs considérés comme hors sujet.",
    source: "France Info",
    topic: "politique",
    publishedAt: hoursAgo(4),
    readTime: 6,
    url: "#",
  },
  {
    id: "5",
    title: "Mistral AI lève 1,5 milliard d'euros pour accélérer son développement",
    summary:
      "La licorne française renforce sa position face aux géants américains avec une levée record pour le secteur européen de l'IA.",
    source: "BFM Business",
    topic: "startup",
    publishedAt: hoursAgo(5),
    readTime: 3,
    url: "#",
  },
  {
    id: "6",
    title: "Le Festival de Cannes dévoile sa sélection officielle 2026",
    summary:
      "Parmi les 21 films en compétition, trois productions françaises et un premier film remarqué venu du Sénégal.",
    source: "Télérama",
    topic: "culture",
    publishedAt: hoursAgo(6),
    readTime: 4,
    url: "#",
  },
  {
    id: "7",
    title: "Des chercheurs découvrent une nouvelle forme de supraconductivité",
    summary:
      "Une équipe franco-japonaise a mis en évidence un état supraconducteur à température ambiante dans un alliage inédit.",
    source: "Science & Vie",
    topic: "science",
    publishedAt: hoursAgo(7),
    readTime: 7,
    url: "#",
  },
  {
    id: "8",
    title: "Le PSG se qualifie pour les demi-finales de la Ligue des Champions",
    summary:
      "Victoire 3-1 face au Bayern Munich grâce à un doublé de Dembélé et un but de Barcola en fin de match.",
    source: "L'Équipe",
    topic: "sport",
    publishedAt: hoursAgo(8),
    readTime: 3,
    url: "#",
  },
  {
    id: "9",
    title: "L'UE adopte une taxe carbone aux frontières renforcée",
    summary:
      "Les 27 se sont mis d'accord sur un mécanisme d'ajustement carbone plus ambitieux, applicable dès janvier 2027.",
    source: "Euronews",
    topic: "environnement",
    publishedAt: hoursAgo(9),
    readTime: 5,
    url: "#",
  },
  {
    id: "10",
    title: "Cyberattaque massive contre un réseau hospitalier français",
    summary:
      "Plusieurs CHU du sud de la France ont été ciblés par un ransomware, perturbant les services d'urgence pendant plusieurs heures.",
    source: "Numerama",
    topic: "cyber",
    publishedAt: hoursAgo(10),
    readTime: 4,
    url: "#",
    isHeadline: true,
  },
  {
    id: "11",
    title: "L'OMS alerte sur une nouvelle variante de grippe aviaire",
    summary:
      "L'organisation internationale appelle à renforcer la surveillance après la détection de cas humains dans trois pays européens.",
    source: "Le Figaro",
    topic: "sante",
    publishedAt: hoursAgo(11),
    readTime: 5,
    url: "#",
  },
  {
    id: "12",
    title: "La croissance française revue à la hausse pour 2026",
    summary:
      "L'INSEE relève ses prévisions à 1,4% grâce à la consommation des ménages et à la reprise de l'investissement industriel.",
    source: "Les Échos",
    topic: "economie",
    publishedAt: hoursAgo(12),
    readTime: 4,
    url: "#",
  },
];

// Templates for generating articles on custom/suggested topics
const ARTICLE_TEMPLATES = [
  {
    title: (label: string) => `${label} : les dernières avancées marquantes`,
    summary: (label: string) =>
      `Un tour d'horizon des développements récents dans le domaine de ${label.toLowerCase()}, avec les analyses de nos experts.`,
    source: "Le Monde",
    readTime: 5,
    isHeadline: true,
  },
  {
    title: (label: string) => `Pourquoi ${label.toLowerCase()} domine l'actualité cette semaine`,
    summary: (label: string) =>
      `Plusieurs événements majeurs liés à ${label.toLowerCase()} ont retenu l'attention des médias et des analystes ces derniers jours.`,
    source: "France Info",
    readTime: 4,
  },
  {
    title: (label: string) => `${label} : ce qu'il faut retenir des dernières 24 heures`,
    summary: (label: string) =>
      `Notre rédaction fait le point sur les informations essentielles concernant ${label.toLowerCase()} publiées aujourd'hui.`,
    source: "Les Échos",
    readTime: 3,
  },
  {
    title: (label: string) => `Décryptage : les enjeux actuels de ${label.toLowerCase()}`,
    summary: (label: string) =>
      `Entre nouvelles réglementations et évolutions du marché, le secteur de ${label.toLowerCase()} traverse une période charnière.`,
    source: "Le Figaro",
    readTime: 6,
  },
];

function generateArticlesForTopic(topic: Topic): Article[] {
  return ARTICLE_TEMPLATES.map((tpl, i) => ({
    id: `gen-${topic.id}-${i}`,
    title: tpl.title(topic.label),
    summary: tpl.summary(topic.label),
    source: tpl.source,
    topic: topic.id,
    publishedAt: hoursAgo(i * 3 + 1),
    readTime: tpl.readTime,
    url: "#",
    isHeadline: tpl.isHeadline ?? false,
  }));
}

export function getArticlesForTopics(topicIds: TopicId[], customTopics: Topic[] = []): Article[] {
  if (topicIds.length === 0) return MOCK_ARTICLES;

  // Articles from default topics
  const defaultArticles = MOCK_ARTICLES.filter((a) => topicIds.includes(a.topic));

  // Generate articles for topics that have no default articles
  const topicsWithArticles = new Set(MOCK_ARTICLES.map((a) => a.topic));
  const allExtraTopics = [...SUGGESTED_TOPICS, ...customTopics];
  const generatedArticles = topicIds
    .filter((id) => !topicsWithArticles.has(id))
    .flatMap((id) => {
      const topic = allExtraTopics.find((t) => t.id === id);
      if (!topic) return [];
      return generateArticlesForTopic(topic);
    });

  return [...defaultArticles, ...generatedArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return `il y a ${Math.floor(diffH / 24)}j`;
}
