import { createClient } from "@/lib/supabase-server"
import Link from "next/link"

export const metadata = {
  title: "Blog - LeilaoFacil",
  description: "Dicas sobre leilao de imoveis da Caixa.",
}

export default async function BlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, category, cover_image, published_at, reading_time")
    .eq("published", true)
    .order("published_at", { ascending: false })

  const featured = posts?.[0]
  const rest = posts?.slice(1) ?? []

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Tudo sobre Leilao de Imoveis</h1>
          <p className="text-blue-200 text-lg">Guias e dicas para comprar com ate 90% de desconto.</p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {featured && (
          <div className="mb-12">
            <p className="text-xs font-semibold text-blue-700 uppercase mb-4">Em Destaque</p>
            <Link href={"/blog/" + featured.slug}>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow grid md:grid-cols-2">
                {featured.cover_image && (
                  <img src={featured.cover_image} alt={featured.title} className="w-full h-64 object-cover" />
                )}
                <div className="p-8 flex flex-col justify-center">
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full mb-4 w-fit">{featured.category}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{featured.title}</h2>
                  <p className="text-gray-500 mb-4">{featured.excerpt}</p>
                  <span className="text-sm text-gray-400">{featured.reading_time} min de leitura</span>
                </div>
              </div>
            </Link>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(rest || []).map((post) => (
            <Link key={post.id} href={"/blog/" + post.slug}>
              <div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden">
                {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full h-44 object-cover" />}
                <div className="p-5">
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full mb-3 w-fit block">{post.category}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-gray-400">{post.reading_time} min de leitura</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {(!posts || posts.length === 0) && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">Nenhum post ainda.</p>
          </div>
        )}
      </div>
    </main>
  )
}
