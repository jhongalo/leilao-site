import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from("blog_posts").select("title, excerpt").eq("slug", params.slug).single()
  if (!post) return { title: "Post nao encontrado" }
  return { title: post.title + " - LeilaoFacil", description: post.excerpt }
}

export default async function BlogPostPage({ params }) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from("blog_posts").select("*").eq("slug", params.slug).eq("published", true).single()
  if (!post) notFound()

  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image, reading_time")
    .eq("published", true).eq("category", post.category).neq("slug", params.slug).limit(3)

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-900 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-blue-300 hover:text-white text-sm mb-6 inline-block">
            ← Voltar ao Blog
          </Link>
          <span className="bg-blue-700 text-blue-100 text-xs px-3 py-1 rounded-full mb-4 block w-fit">{post.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-blue-300 text-sm">{post.reading_time} min de leitura</p>
        </div>
      </section>
      {post.cover_image && (
        <div className="max-w-3xl mx-auto px-4 -mt-6">
          <img src={post.cover_image} alt={post.title} className="w-full h-72 object-cover rounded-2xl shadow-lg" />
        </div>
      )}
      <article className="max-w-3xl mx-auto px-4 py-10">
        <div className="prose prose-lg prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
      <section className="max-w-3xl mx-auto px-4 mb-12">
        <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Pronto para comprar com desconto?</h2>
          <p className="text-blue-200 mb-6">Veja os imoveis disponiveis agora.</p>
          <Link href="/imoveis" className="bg-white text-blue-900 font-bold px-8 py-3 rounded-xl inline-block hover:bg-blue-50">
            Ver Imoveis
          </Link>
        </div>
      </section>
      {related && related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <h3 className="text-xl font-bold mb-6">Artigos Relacionados</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((rel) => (
              <Link key={rel.id} href={"/blog/" + rel.slug}>
                <div className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden">
                  {rel.cover_image && <img src={rel.cover_image} alt={rel.title} className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    <h4 className="font-bold text-sm mb-1">{rel.title}</h4>
                    <p className="text-xs text-gray-400">{rel.reading_time} min</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
