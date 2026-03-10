"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("publicado", true)
        .order("created_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    }
    carregar();
  }, []);

  const categorias = ["Todos", "Como Funciona", "Dicas", "Mercado", "FGTS", "Financiamento"];
  const [catAtiva, setCatAtiva] = useState("Todos");

  const postsFiltrados = catAtiva === "Todos" ? posts : posts.filter(p => p.categoria === catAtiva);

  return (
    <>
      <Navbar />
      <main style={{paddingTop:"64px",minHeight:"100vh",background:"#0a0a0f",color:"white"}}>

        {/* Hero */}
        <div style={{background:"linear-gradient(135deg,#111118,#18181f)",borderBottom:"1px solid #2a2a35",padding:"60px 16px 40px"}}>
          <div style={{maxWidth:"900px",margin:"0 auto",textAlign:"center"}}>
            <span style={{background:"#f97316",color:"white",fontSize:"11px",fontWeight:"700",padding:"4px 12px",borderRadius:"20px",textTransform:"uppercase",marginBottom:"16px",display:"inline-block"}}>
              Blog
            </span>
            <h1 style={{fontSize:"36px",fontWeight:"800",margin:"12px 0 16px",lineHeight:"1.2"}}>
              Aprenda tudo sobre<br/>
              <span style={{color:"#f97316"}}>Imóveis em Leilão</span>
            </h1>
            <p style={{color:"#9ca3af",fontSize:"16px",maxWidth:"600px",margin:"0 auto"}}>
              Dicas, guias e estratégias para comprar imóveis com até 90% de desconto na Caixa Econômica Federal.
            </p>
          </div>
        </div>

        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"40px 16px"}}>

          {/* Categorias */}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"32px"}}>
            {categorias.map(cat => (
              <button key={cat} onClick={() => setCatAtiva(cat)}
                style={{background: catAtiva === cat ? "#f97316" : "#111118",color: catAtiva === cat ? "white" : "#9ca3af",
                  border: catAtiva === cat ? "none" : "1px solid #2a2a35",padding:"8px 16px",borderRadius:"20px",
                  fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:"60px",color:"#6b6b80"}}>Carregando posts...</div>
          ) : postsFiltrados.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px",color:"#6b6b80"}}>
              <div style={{fontSize:"48px",marginBottom:"16px"}}>✍️</div>
              <p>Nenhum post ainda. Em breve!</p>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"24px"}}>
              {postsFiltrados.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{textDecoration:"none"}}>
                  <article style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"16px",overflow:"hidden",transition:"border-color 0.2s"}}>
                    <div style={{height:"180px",background:"#18181f",overflow:"hidden"}}>
                      {post.imagem ? (
                        <img src={post.imagem} alt={post.titulo} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                      ) : (
                        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"48px"}}>
                          {post.emoji || "🏠"}
                        </div>
                      )}
                    </div>
                    <div style={{padding:"20px"}}>
                      {post.categoria && (
                        <span style={{background:"#18181f",border:"1px solid #2a2a35",color:"#f97316",fontSize:"11px",fontWeight:"600",padding:"3px 10px",borderRadius:"20px",marginBottom:"10px",display:"inline-block"}}>
                          {post.categoria}
                        </span>
                      )}
                      <h2 style={{fontSize:"16px",fontWeight:"700",color:"white",lineHeight:"1.4",margin:"8px 0 10px"}}>{post.titulo}</h2>
                      <p style={{color:"#6b6b80",fontSize:"13px",lineHeight:"1.6",margin:"0 0 16px",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                        {post.resumo}
                      </p>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"12px",color:"#4b5563"}}>
                        <span>📅 {new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
                        <span style={{color:"#f97316",fontWeight:"600"}}>Ler mais →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {/* CTA imóveis */}
          <div style={{background:"linear-gradient(135deg,#111118,#18181f)",border:"1px solid #2a2a35",borderRadius:"16px",padding:"40px",textAlign:"center",marginTop:"60px"}}>
            <h3 style={{fontSize:"22px",fontWeight:"700",marginBottom:"12px"}}>Pronto para encontrar seu imóvel?</h3>
            <p style={{color:"#9ca3af",marginBottom:"24px"}}>Mais de 500 imóveis com descontos de até 90%</p>
            <Link href="/imoveis" style={{background:"#f97316",color:"white",padding:"14px 32px",borderRadius:"12px",textDecoration:"none",fontWeight:"700",fontSize:"15px"}}>
              Ver Imóveis em Leilão →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
