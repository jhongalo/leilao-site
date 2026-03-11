import axios from "axios"
import * as cheerio from "cheerio"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = createClient()

  try {
    const { data } = await axios.get("https://vivaleilao.com.br/noticias", {
      headers: { "User-Agent": "Mozilla/5.0" }
    })

    const $ = cheerio.load(data)
    const posts = []

    $("article").each((i, el) => {
      const title = $(el).find("h2").text().trim()
      if (!title) return
      const slug = title.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 80)
      const excerpt = $(el).find("p").first().text().trim() || "Leia mais..."
      const cover_image = $(el).find("img").attr("src") || null

      posts.push({
        title,
        slug,
        excerpt,
        content: "<p>" + excerpt + "</p>",
        cover_image,
        published: true,
        category: "Noticias"
      })
    })

    if (posts.length === 0) {
      return Response.json({ success: true, message: "Nenhum post encontrado", posts: [] })
    }

    const { error } = await supabase
      .from("blog_posts")
      .upsert(posts, { onConflict: "slug" })

    if (error) throw error

    return Response.json({ success: true, inseridos: posts.length })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
