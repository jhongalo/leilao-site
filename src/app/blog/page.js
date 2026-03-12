import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Blog — Dicas sobre Imóveis de Leilão | LeilãoFácil",
  description: "Aprenda tudo sobre leilões imobiliários, como participar, financiar com FGTS e encontrar os melhores imóveis da Caixa Econômica Federal.",
}

export default async function BlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, created_at, reading_time, category")
    .eq("published", true)
    .order("created_at", { ascending: false })

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {/* HERO */}
        <section
          className="py-20 px-4 text-center"
          style={{
            background: "linear-gradient(135deg, #0a0a0f 0%, #111118 60%, #0f0f1a 100%)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="max-w-3xl mx-auto">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}
            >
              Blog LeilãoFácil
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Guia Completo sobre<br />
              <span style={{ color: "#f97316" }}>Imóveis de Leilão</span>
            </h1>
            <p style={{ color: "var(--muted)" }} className="text-lg">
              Tudo o que você precisa saber para comprar com segurança e economizar.
            </p>
          </div>
        </section>

        {/* POSTS */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-20" style={{ color: "var(--muted)" }}>
              <p className="text-xl">Nenhum post publicado ainda.</p>
              <Link href="/imoveis" className="mt-6 inline-block" style={{ color: "#f97316" }}>
                Ver imóveis disponíveis →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  {/* Card top accent */}
                  <div style={{ height: 4, background: "linear-gradient(90deg, #f97316, #dc2626)" }} />

                  <div className="p-6">
                    {post.category && (
                      <span
                        className="inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4"
                        style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}
                      >
                        {post.category}
                      </span>
                    )}

                    <h2 className="text-lg font-bold mb-3 line-clamp-2" style={{ color: "var(--text)" }}>
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm leading-relaxed line-clamp-3 mb-5" style={{ color: "var(--muted)" }}>
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                      <span>
                        {new Date(post.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {post.reading_time && <span>{post.reading_time} min de leitura</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section
          className="py-14 px-4 text-center"
          style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-extrabold mb-3">Pronto para encontrar seu imóvel?</h2>
            <p className="mb-7" style={{ color: "var(--muted)" }}>
              Veja os imóveis disponíveis agora com os melhores descontos.
            </p>
            <Link
              href="/imoveis"
              className="inline-block font-bold px-8 py-4 rounded-xl text-white transition-all hover:scale-105"
              style={{ background: "#f97316", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}
            >
              Buscar Imóveis →
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className="py-8 px-4 text-center text-sm"
          style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
        >
          <p>© 2026 LeilãoFácil · Todos os direitos reservados</p>
          <p className="mt-1">Este não é um site oficial da Caixa Econômica Federal</p>
        </footer>
      </main>
    </>
  )
}
