import { NextResponse } from "next/server";
import { type Topic } from "@/lib/mock-data";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_BASE = "https://gnews.io/api/v4";

// Rich keyword mapping with synonyms using OR operators for GNews
// GNews supports: AND (space), OR, NOT, "exact phrase"
const TOPIC_KEYWORDS: Record<string, string[]> = {
  tech: ["technologie OR numérique OR high-tech OR innovation"],
  ia: ["intelligence artificielle OR IA OR ChatGPT OR machine learning OR deep learning"],
  finance: ["finance OR bourse OR marchés financiers OR CAC 40 OR investissement"],
  politique: ["politique OR gouvernement OR Assemblée nationale OR élections OR réforme"],
  culture: ["culture OR exposition OR musée OR spectacle OR patrimoine"],
  science: ["science OR recherche scientifique OR découverte OR CNRS OR laboratoire"],
  sport: ["sport OR Ligue 1 OR football OR rugby OR Jeux olympiques OR tennis"],
  environnement: ["environnement OR climat OR réchauffement OR écologie OR biodiversité"],
  sante: ["santé OR médecine OR hôpital OR OMS OR vaccin OR épidémie"],
  economie: ["économie OR PIB OR croissance OR inflation OR emploi OR INSEE"],
  startup: ["startup OR levée de fonds OR licorne OR incubateur OR French Tech"],
  cyber: ["cybersécurité OR cyberattaque OR piratage OR ransomware OR hacker"],
  immobilier: ["immobilier OR logement OR construction OR loyer OR crédit immobilier"],
  automobile: ["automobile OR voiture électrique OR Tesla OR Renault OR mobilité"],
  mode: ["mode OR fashion OR luxe OR haute couture OR LVMH OR prêt-à-porter"],
  gastronomie: ["gastronomie OR restaurant OR chef OR cuisine OR Michelin"],
  voyage: ["voyage OR tourisme OR aérien OR destination OR hôtellerie"],
  education: ["éducation OR école OR université OR enseignement OR Parcoursup"],
  droit: ["justice OR tribunal OR procès OR loi OR avocat OR Cour de cassation"],
  design: ["design OR architecture OR UX OR graphisme OR création"],
  musique: ["musique OR concert OR album OR festival OR artiste OR rap"],
  gaming: ["jeux vidéo OR gaming OR esport OR PlayStation OR Nintendo OR Steam"],
  crypto: ["crypto OR bitcoin OR blockchain OR ethereum OR NFT OR Web3"],
  espace: ["espace OR NASA OR SpaceX OR satellite OR astronaute OR fusée OR ESA"],
  energie: ["énergie OR nucléaire OR renouvelable OR solaire OR pétrole OR électricité"],
  media: ["médias OR télévision OR presse OR audiovisuel OR streaming"],
  emploi: ["emploi OR recrutement OR chômage OR salaire OR Pôle emploi OR RH"],
  agriculture: ["agriculture OR agriculteur OR récolte OR PAC OR agroalimentaire"],
  defense: ["défense OR armée OR militaire OR OTAN OR sécurité nationale"],
  cinema: ["cinéma OR film OR réalisateur OR Cannes OR box-office OR acteur"],
  litterature: ["littérature OR livre OR roman OR auteur OR prix Goncourt OR édition"],
  philosophie: ["philosophie OR pensée OR intellectuel OR débat OR essai"],
  geopolitique: ["géopolitique OR diplomatie OR relations internationales OR conflit OR guerre OR ONU OR OTAN"],
};

function getKeywords(topicId: string, customTopics: Topic[]): string[] {
  if (TOPIC_KEYWORDS[topicId]) return TOPIC_KEYWORDS[topicId];

  // For custom topics, build smart queries from the label
  const topic = customTopics.find((t) => t.id === topicId);
  const label = topic?.label ?? topicId;
  return [label];
}

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

async function fetchGNews(query: string, max: number = 10): Promise<GNewsArticle[]> {
  const url = `${GNEWS_BASE}/search?q=${encodeURIComponent(query)}&lang=fr&max=${max}&apikey=${GNEWS_API_KEY}`;
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topics = searchParams.get("topics")?.split(",").filter(Boolean) ?? [];
  const customTopicsRaw = searchParams.get("customTopics");
  const customTopics: Topic[] = customTopicsRaw ? JSON.parse(customTopicsRaw) : [];

  if (!GNEWS_API_KEY || GNEWS_API_KEY === "your_api_key_here") {
    return NextResponse.json({ error: "NO_API_KEY", articles: [] }, { status: 200 });
  }

  if (topics.length === 0) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const allArticles = await Promise.all(
      topics.map(async (topicId) => {
        const queries = getKeywords(topicId, customTopics);

        // Try primary query (fetch 10, deduplicate, keep 5)
        let articles = await fetchGNews(queries[0], 10);

        // If no results and we have a custom topic, try just the label as-is
        if (articles.length === 0 && !TOPIC_KEYWORDS[topicId]) {
          const topic = customTopics.find((t) => t.id === topicId);
          if (topic) {
            articles = await fetchGNews(topic.label, 10);
          }
        }

        // Deduplicate by normalized title (same story from different sources)
        const seen = new Set<string>();
        const unique = articles.filter((a) => {
          const key = a.title.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 5);

        return unique.map((a: GNewsArticle, i: number) => ({
          id: `${topicId}-${i}-${Date.now()}`,
          title: a.title,
          summary: a.description ?? "",
          source: a.source?.name ?? "Source inconnue",
          topic: topicId,
          publishedAt: a.publishedAt,
          readTime: Math.max(2, Math.ceil((a.description?.length ?? 100) / 200)),
          url: a.url,
          imageUrl: a.image,
          isHeadline: i === 0,
        }));
      })
    );

    // Global deduplication across topics
    const globalSeen = new Set<string>();
    const articles = allArticles
      .flat()
      .filter((a) => {
        const key = a.title.toLowerCase().trim();
        if (globalSeen.has(key)) return false;
        globalSeen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: "FETCH_ERROR", articles: [] }, { status: 200 });
  }
}
