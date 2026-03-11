import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = createClient()
  const { data: post } = await supabase
    .from("blog_posts").select("title, excerpt").eq("slug", slug).single()
  if (!post) return { title: "Post nao encontrado" }
  return { title: post.title + " - LeilaoFacil", description: post.excerpt }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const supabase = createClient()
  const { data: post } = await supabase
    .from("blog_posts").select("*").eq("slug", slug).eq("published", true).single()
  if (!post) notFound()
  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image, reading_time")
    .eq("published", true).neq("slug", slug).limit(3)
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-900 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-blue-300 hover:text-white text-sm mb-6 inline-block">Voltar ao Blog</Link>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-blue-300 text-sm">{post.reading_time} min de leitura</p>
        </div>
      </section>
      <article className="max-w-3xl mx-auto px-4 py-10">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
      <section className="max-w-3xl mx-auto px-4 mb-12">
        <div className="bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Pronto para comprar com desconto?</h2>
          <Link href="/imoveis" className="bg-white text-blue-900 font-bold px-8 py-3 rounded-xl inline-block">Ver Imoveis</Link>
        </div>
      </section>
    </main>
  )
}
