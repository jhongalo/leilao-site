import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "@/components/Navbar"

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = createClient()
  const { data: post } = await supabase
    .from("blog_posts").select("title, excerpt").eq("slug", slug).single()
  if (!post) return { title: "Post não encontrado" }
  return { title: post.title + " - LeilãoFácil", description: post.excerpt }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const supabase = createClient()
  const { data: post } = await supabase
    .from("blog_posts").select("*").eq("slug", slug).eq("published", true).single()

  if (!post) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {/* HEADER */}
        <section
          className="py-16 px-4"
          style={{
            background: "linear-gradient(135deg, #0a0a0f 0%, #111118 100%)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
              style={{ color: "var(--muted)" }}
            >
              ← Voltar ao Blog
            </Link>

            {post.category && (
              <span
                className="inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-5"
                style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}
              >
                {post.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
              {post.created_at && (
                <span>
                  {new Date(post.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              {post.reading_time && (
                <>
                  <span>·</span>
                  <span>{post.reading_time} min de leitura</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ARTICLE */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-2xl font-extrabold mb-3">Pronto para comprar com desconto?</h2>
            <p className="mb-6" style={{ color: "var(--muted)" }}>
              Explore os imóveis disponíveis agora mesmo.
            </p>
            <Link
              href="/imoveis"
              className="inline-block font-bold px-8 py-4 rounded-xl text-white transition-all hover:scale-105"
              style={{ background: "#f97316", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}
            >
              Ver Imóveis →
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
