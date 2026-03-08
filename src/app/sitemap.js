import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function sitemap() {
  const baseUrl = "https://clever-raindrop-8346f0.netlify.app";

  // Páginas estáticas
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/imoveis`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  ];

  // Páginas dinâmicas dos imóveis
  const { data: imoveis } = await supabase
    .from("imoveis")
    .select("codigo_caixa, created_at")
    .limit(5000);

  const imovelPages = (imoveis || []).map(i => ({
    url: `${baseUrl}/imoveis/${i.codigo_caixa}`,
    lastModified: new Date(i.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...imovelPages];
}
