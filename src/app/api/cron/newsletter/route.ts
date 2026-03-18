import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { type Topic } from "@/lib/mock-data";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const GNEWS_BASE = "https://gnews.io/api/v4";

// Use service role key to bypass RLS and read all profiles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOPIC_KEYWORDS: Record<string, string> = {
  tech: "technologie OR numérique OR high-tech OR innovation",
  ia: "intelligence artificielle OR IA OR ChatGPT OR machine learning OR deep learning",
  finance: "finance OR bourse OR marchés financiers OR CAC 40 OR investissement",
  politique: "politique OR gouvernement OR Assemblée nationale OR élections OR réforme",
  culture: "culture OR exposition OR musée OR spectacle OR patrimoine",
  science: "science OR recherche scientifique OR découverte OR CNRS OR laboratoire",
  sport: "sport OR Ligue 1 OR football OR rugby OR Jeux olympiques OR tennis",
  environnement: "environnement OR climat OR réchauffement OR écologie OR biodiversité",
  sante: "santé OR médecine OR hôpital OR OMS OR vaccin OR épidémie",
  economie: "économie OR PIB OR croissance OR inflation OR emploi OR INSEE",
  startup: "startup OR levée de fonds OR licorne OR incubateur OR French Tech",
  cyber: "cybersécurité OR cyberattaque OR piratage OR ransomware OR hacker",
  immobilier: "immobilier OR logement OR construction OR loyer OR crédit immobilier",
  automobile: "automobile OR voiture électrique OR Tesla OR Renault OR mobilité",
  mode: "mode OR fashion OR luxe OR haute couture OR LVMH OR prêt-à-porter",
  gastronomie: "gastronomie OR restaurant OR chef OR cuisine OR Michelin",
  voyage: "voyage OR tourisme OR aérien OR destination OR hôtellerie",
  education: "éducation OR école OR université OR enseignement OR Parcoursup",
  droit: "justice OR tribunal OR procès OR loi OR avocat OR Cour de cassation",
  design: "design OR architecture OR UX OR graphisme OR création",
  musique: "musique OR concert OR album OR festival OR artiste OR rap",
  gaming: "jeux vidéo OR gaming OR esport OR PlayStation OR Nintendo OR Steam",
  crypto: "crypto OR bitcoin OR blockchain OR ethereum OR NFT OR Web3",
  espace: "espace OR NASA OR SpaceX OR satellite OR astronaute OR fusée OR ESA",
  energie: "énergie OR nucléaire OR renouvelable OR solaire OR pétrole OR électricité",
  media: "médias OR télévision OR presse OR audiovisuel OR streaming",
  emploi: "emploi OR recrutement OR chômage OR salaire OR Pôle emploi OR RH",
  agriculture: "agriculture OR agriculteur OR récolte OR PAC OR agroalimentaire",
  defense: "défense OR armée OR militaire OR OTAN OR sécurité nationale",
  cinema: "cinéma OR film OR réalisateur OR Cannes OR box-office OR acteur",
  litterature: "littérature OR livre OR roman OR auteur OR prix Goncourt OR édition",
  philosophie: "philosophie OR pensée OR intellectuel OR débat OR essai",
  geopolitique: "géopolitique OR diplomatie OR relations internationales OR conflit OR guerre OR ONU OR OTAN",
};

const TOPIC_LABELS: Record<string, string> = {
  tech: "Tech", ia: "Intelligence Artificielle", finance: "Finance",
  politique: "Politique", culture: "Culture", science: "Science",
  sport: "Sport", environnement: "Environnement", sante: "Santé",
  economie: "Économie", startup: "Startups", cyber: "Cybersécurité",
  immobilier: "Immobilier", automobile: "Automobile", mode: "Mode",
  gastronomie: "Gastronomie", voyage: "Voyage", education: "Éducation",
  droit: "Droit & Justice", design: "Design", musique: "Musique",
  gaming: "Gaming", crypto: "Crypto", espace: "Espace",
  energie: "Énergie", media: "Médias", emploi: "Emploi",
  agriculture: "Agriculture", defense: "Défense", cinema: "Cinéma",
  litterature: "Littérature", philosophie: "Philosophie", geopolitique: "Géopolitique",
};

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

interface Article {
  title: string;
  summary: string;
  source: string;
  topic: string;
  topicLabel: string;
  url: string;
  publishedAt: string;
  readTime: number;
}

// Cache articles per topic to avoid duplicate GNews calls for users with same topics
const articleCache = new Map<string, Article[]>();

async function fetchTopicArticles(topicId: string, customTopics: Topic[]): Promise<Article[]> {
  if (articleCache.has(topicId)) return articleCache.get(topicId)!;

  const query = TOPIC_KEYWORDS[topicId] ?? customTopics.find(t => t.id === topicId)?.label ?? topicId;
  const url = `${GNEWS_BASE}/search?q=${encodeURIComponent(query)}&lang=fr&max=5&apikey=${GNEWS_API_KEY}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const articles: GNewsArticle[] = data.articles ?? [];
    const label = TOPIC_LABELS[topicId] ?? customTopics.find(t => t.id === topicId)?.label ?? topicId;

    const result = articles.slice(0, 3).map(a => ({
      title: a.title,
      summary: a.description ?? "",
      source: a.source?.name ?? "Source inconnue",
      topic: topicId,
      topicLabel: label,
      url: a.url,
      publishedAt: a.publishedAt,
      readTime: Math.max(2, Math.ceil((a.description?.length ?? 100) / 200)),
    }));

    articleCache.set(topicId, result);
    return result;
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "il y a moins d'1h";
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

function buildEmailHtml(name: string, articles: Article[]): string {
  const today = formatDate(new Date().toISOString());
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presslyyy.vercel.app";

  const byTopic = articles.reduce<Record<string, Article[]>>((acc, a) => {
    if (!acc[a.topicLabel]) acc[a.topicLabel] = [];
    acc[a.topicLabel].push(a);
    return acc;
  }, {});

  const topicSections = Object.entries(byTopic).map(([label, items]) => `
    <tr><td style="padding: 0 32px 8px;">
      <p style="margin:0; font-family:'DM Sans',Arial,sans-serif; font-size:11px; font-weight:700;
        letter-spacing:2px; text-transform:uppercase; color:#B8952A;">— ${label}</p>
    </td></tr>
    ${items.map(a => `
    <tr><td style="padding: 0 32px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#ffffff; border-radius:8px; border:1px solid #EDE8DC; overflow:hidden;">
        <tr><td style="padding:20px 24px;">
          <a href="${a.url}" style="text-decoration:none;">
            <p style="margin:0 0 8px; font-family:Georgia,serif; font-size:17px; font-weight:700;
              line-height:1.4; color:#C8392B;">${a.title}</p>
          </a>
          <p style="margin:0 0 12px; font-family:'DM Sans',Arial,sans-serif; font-size:14px;
            line-height:1.6; color:#3D352C;">${a.summary}</p>
          <p style="margin:0; font-family:'DM Sans',Arial,sans-serif; font-size:12px; color:#6B5E52;">
            <strong>${a.source}</strong> · ${timeAgo(a.publishedAt)} · ${a.readTime} min de lecture
          </p>
        </td></tr>
      </table>
    </td></tr>
    `).join("")}
  `).join("");

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Pressly — Votre revue du jour</title></head>
<body style="margin:0;padding:0;background:#EDE8DC;font-family:'DM Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EDE8DC;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#1A1410;border-radius:12px 12px 0 0;padding:28px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td><span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#F5F0E8;
        letter-spacing:-0.5px;">Pressly</span>
        <span style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#B8952A;
          letter-spacing:2px;text-transform:uppercase;margin-left:8px;">ÉDITION</span>
      </td>
    </tr></table>
    <p style="margin:12px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;
      text-transform:uppercase;letter-spacing:2px;color:#6B5E52;">${today}</p>
    <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px;font-weight:700;
      color:#F5F0E8;line-height:1.3;">Bonjour, ${name}.</h1>
    <p style="margin:6px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;
      color:#6B5E52;">Votre revue de presse personnalisée du jour</p>
  </td></tr>

  <!-- Stats bar -->
  <tr><td style="background:#C8392B;padding:12px 32px;">
    <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#F5F0E8;">
      <strong>${articles.length} articles</strong> · ${Object.keys(byTopic).length} thèmes
      · ${articles.reduce((s, a) => s + a.readTime, 0)} min de lecture
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#F5F0E8;padding:32px 0 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${topicSections}
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1A1410;border-radius:0 0 12px 12px;padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td><span style="font-family:Georgia,serif;font-size:16px;font-weight:700;
        color:#F5F0E8;">Pressly</span></td>
      <td align="right">
        <a href="${siteUrl}/settings"
          style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#6B5E52;
          text-decoration:none;">Se désabonner</a>
      </td>
    </tr></table>
    <p style="margin:8px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#3D352C;">
      Votre revue de presse personnalisée, générée par l'IA · Envoyée chaque matin à 9h
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users with newsletter enabled
    const { data: profiles, error: dbError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("newsletter_enabled", true);

    if (dbError) {
      console.error("[Cron] DB error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No subscribers", sent: 0 });
    }

    if (!RESEND_API_KEY || !GNEWS_API_KEY) {
      return NextResponse.json({ error: "Missing API keys" }, { status: 500 });
    }

    const resend = new Resend(RESEND_API_KEY);
    let sent = 0;
    let errors = 0;

    // Clear article cache for fresh results
    articleCache.clear();

    for (const profile of profiles) {
      const email = profile.newsletter_email || profile.email;
      const topics: string[] = profile.topics ?? [];
      const customTopics: Topic[] = profile.custom_topics ?? [];
      const name: string = profile.name || "lecteur";

      if (!email || topics.length === 0) continue;

      // Fetch articles for this user's topics
      const allArticles: Article[] = [];
      for (const t of topics) {
        const topicArticles = await fetchTopicArticles(t, customTopics);
        allArticles.push(...topicArticles);
        // Delay between requests to avoid GNews rate limiting
        await new Promise(r => setTimeout(r, 500));
      }

      if (allArticles.length === 0) continue;

      const html = buildEmailHtml(name, allArticles);

      try {
        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Pressly <onboarding@resend.dev>",
          to: email,
          subject: `Pressly — Votre revue du ${formatDate(new Date().toISOString())}`,
          html,
        });

        if (error) {
          console.error(`[Cron] Failed to send to ${email}:`, error);
          errors++;
        } else {
          sent++;
          console.log(`[Cron] Newsletter sent to ${email} (${allArticles.length} articles)`);
        }
      } catch (err) {
        console.error(`[Cron] Error sending to ${email}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      message: `Newsletter cron completed`,
      sent,
      errors,
      total: profiles.length,
    });
  } catch (err) {
    console.error("[Cron] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
