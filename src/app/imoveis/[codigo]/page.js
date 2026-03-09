"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function fmt(val) {
  if (!val) return "—";
  return "R$ " + Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ImovelPage() {
  const params = useParams();
  const codigo = decodeURIComponent(params.codigo);
  const [imovel, setImovel] = useState(null);
  const [similares, setSimilares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .eq("codigo_caixa", codigo)
        .limit(1);

      if (error) setErro(JSON.stringify(error));

      if (data && data.length > 0) {
        setImovel(data[0]);
        const { data: sim } = await supabase
          .from("imoveis")
          .select("*")
          .eq("estado", data.estado)
          .neq("codigo_caixa", codigo)
          .limit(3);
        setSimilares(sim || []);
      }
      setLoading(false);
    }
    carregar();
  }, [codigo]);

  if (loading) return (
    <>
      <Navbar />
      <main style={{paddingTop:"64px",minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"#f97316",fontSize:"18px"}}>Carregando imóvel...</div>
      </main>
    </>
  );

  if (!imovel) return (
    <>
      <Navbar />
      <main style={{paddingTop:"64px",minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"16px",padding:"32px"}}>
        <div style={{fontSize:"48px"}}>😕</div>
        <div style={{color:"white",fontSize:"18px"}}>Imóvel não encontrado</div>
        <div style={{color:"#6b6b80",fontSize:"12px"}}>Código: {codigo}</div>
        {erro && <div style={{color:"#f87171",fontSize:"11px",maxWidth:"600px",wordBreak:"break-all",textAlign:"center"}}>Erro: {erro}</div>}
        <Link href="/imoveis" style={{color:"#f97316",textDecoration:"none"}}>← Voltar à lista</Link>
      </main>
    </>
  );

  const desconto = imovel.desconto || (imovel.valor_avaliacao && imovel.valor_leilao
    ? Math.round((1 - imovel.valor_leilao / imovel.valor_avaliacao) * 100) : 0);

  const fotos = Array.isArray(imovel.fotos)
    ? imovel.fotos.filter(f => f && typeof f === "string" && f.startsWith("http"))
    : [];
  const fotoFinal = fotos[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";
  const economia = (imovel.valor_avaliacao || 0) - (imovel.valor_leilao || 0);

  const MODALIDADE_CORES = {
    "Compra Direta": "#16a34a",
    "Licitação aberta": "#d97706",
    "Leilão SFI": "#dc2626",
    "Venda Online": "#2563eb",
    "Venda Direta Online": "#7c3aed",
  };
  const corModal = MODALIDADE_CORES[imovel.modalidade] || "#6b7280";

  return (
    <>
      <Navbar />
      <main style={{paddingTop:"64px",minHeight:"100vh",background:"#0a0a0f",color:"white"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"32px 16px"}}>

          <nav style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"13px",color:"#6b6b80",marginBottom:"24px",flexWrap:"wrap"}}>
            <Link href="/" style={{color:"#6b6b80",textDecoration:"none"}}>Início</Link>
            <span>›</span>
            <Link href="/imoveis" style={{color:"#6b6b80",textDecoration:"none"}}>Imóveis</Link>
            <span>›</span>
            <span style={{color:"white"}}>{imovel.titulo}</span>
          </nav>

          <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:"32px",alignItems:"flex-start"}}>

            <div style={{display:"flex",flexDirection:"column",gap:"24px",minWidth:0}}>

              <div>
                {imovel.modalidade && (
                  <span style={{background:corModal,color:"white",fontSize:"11px",fontWeight:"700",padding:"4px 12px",borderRadius:"20px",textTransform:"uppercase",marginBottom:"12px",display:"inline-block"}}>
                    {imovel.modalidade}
                  </span>
                )}
                <h1 style={{fontSize:"24px",fontWeight:"800",color:"white",margin:"8px 0",lineHeight:"1.3"}}>
                  {imovel.titulo?.toUpperCase()}
                </h1>
                <p style={{color:"#6b6b80",fontSize:"14px"}}>
                  📍 {[imovel.endereco, imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(", ")}
                </p>
              </div>

              <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",overflow:"hidden"}}>
                <div style={{position:"relative",height:"380px",background:"#18181f"}}>
                  <img src={fotoFinal} alt={imovel.titulo} style={{width:"100%",height:"100%",objectFit:"cover"}}
                    onError={e => e.target.src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"} />
                  {desconto > 0 && (
                    <span style={{position:"absolute",top:"16px",left:"16px",background:"linear-gradient(135deg,#f97316,#dc2626)",color:"white",fontSize:"14px",fontWeight:"700",padding:"6px 14px",borderRadius:"20px"}}>
                      {desconto}% OFF
                    </span>
                  )}
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
                <DestCard icon="🏷️" label="Desconto" value={`${desconto}%`} cor="#f97316" />
                <DestCard icon="💰" label="Você economiza" value={economia > 0 ? `R$ ${Math.round(economia).toLocaleString("pt-BR")}` : "—"} cor="#4ade80" />
                <DestCard icon="🏠" label="Tipo" value={imovel.tipo_imovel || "—"} cor="#60a5fa" />
              </div>

              <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"24px"}}>
                <h2 style={{fontSize:"18px",fontWeight:"700",marginBottom:"16px"}}>Sobre este imóvel</h2>
                {imovel.descricao && imovel.descricao !== "." && (
                  <p style={{color:"#9ca3af",fontSize:"14px",lineHeight:"1.7",marginBottom:"20px"}}>{imovel.descricao}</p>
                )}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
                  {imovel.tipo_imovel && <InfoItem icon="🏠" label="Tipo" value={imovel.tipo_imovel} />}
                  {imovel.modalidade && <InfoItem icon="📋" label="Modalidade" value={imovel.modalidade} />}
                  {imovel.estado && <InfoItem icon="🗺️" label="Estado" value={imovel.estado} />}
                  {imovel.cidade && <InfoItem icon="🏙️" label="Cidade" value={imovel.cidade} />}
                  {imovel.bairro && <InfoItem icon="📍" label="Bairro" value={imovel.bairro} />}
                  {imovel.data_leilao && <InfoItem icon="📅" label="Data Leilão" value={new Date(imovel.data_leilao).toLocaleDateString("pt-BR")} />}
                </div>
              </div>

              <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"24px"}}>
                <h2 style={{fontSize:"18px",fontWeight:"700",marginBottom:"12px"}}>Localização</h2>
                <p style={{color:"#9ca3af",fontSize:"14px",marginBottom:"16px"}}>
                  📍 {[imovel.endereco, imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(", ")}
                </p>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent([imovel.endereco, imovel.cidade, imovel.estado].filter(Boolean).join(", "))}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#18181f",border:"1px solid #2a2a35",color:"#9ca3af",padding:"8px 16px",borderRadius:"8px",fontSize:"13px",textDecoration:"none"}}>
                  🗺️ Ver no Google Maps
                </a>
              </div>

              {similares.length > 0 && (
                <div>
                  <h2 style={{fontSize:"18px",fontWeight:"700",marginBottom:"16px"}}>Imóveis Similares em {imovel.estado}</h2>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>
                    {similares.map(s => {
                      const sfoto = Array.isArray(s.fotos) ? s.fotos[0] : s.fotos;
                      const sfotoFinal = sfoto && typeof sfoto === "string" && sfoto.startsWith("http") ? sfoto : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
                      return (
                        <Link key={s.codigo_caixa} href={`/imoveis/${s.codigo_caixa}`} style={{textDecoration:"none",background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",overflow:"hidden",display:"block"}}>
                          <img src={sfotoFinal} alt={s.titulo} style={{width:"100%",height:"120px",objectFit:"cover"}} />
                          <div style={{padding:"12px"}}>
                            <p style={{fontSize:"12px",fontWeight:"600",color:"white",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:"4px"}}>{s.titulo}</p>
                            <p style={{color:"#f97316",fontSize:"13px",fontWeight:"700"}}>{fmt(s.valor_leilao)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{position:"sticky",top:"80px",display:"flex",flexDirection:"column",gap:"16px"}}>

              <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"24px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"4px"}}>
                  <span style={{fontSize:"26px",fontWeight:"800",color:"white"}}>{fmt(imovel.valor_leilao)}</span>
                  {desconto > 0 && (
                    <span style={{background:"linear-gradient(135deg,#f97316,#dc2626)",color:"white",fontSize:"12px",fontWeight:"700",padding:"4px 10px",borderRadius:"20px"}}>
                      {desconto}% OFF
                    </span>
                  )}
                </div>
                {imovel.valor_avaliacao > 0 && (
                  <p style={{color:"#4b5563",fontSize:"13px",textDecoration:"line-through",marginBottom:"16px"}}>
                    Avaliação: {fmt(imovel.valor_avaliacao)}
                  </p>
                )}
                <div style={{marginBottom:"20px"}}>
                  {imovel.modalidade && <RowInfo label="Modalidade" value={imovel.modalidade} />}
                  {imovel.data_leilao && <RowInfo label="Data do Leilão" value={new Date(imovel.data_leilao).toLocaleString("pt-BR")} />}
                </div>
                <a href={imovel.link_imovel_caixa || "#"} target="_blank" rel="noopener noreferrer"
                  style={{display:"block",background:"#f97316",color:"white",textAlign:"center",fontWeight:"700",padding:"14px",borderRadius:"12px",textDecoration:"none",fontSize:"15px",marginBottom:"10px"}}>
                  🔗 Consultar na Caixa
                </a>
                <Link href="/imoveis"
                  style={{display:"block",background:"#18181f",border:"1px solid #2a2a35",color:"#9ca3af",textAlign:"center",fontWeight:"500",padding:"12px",borderRadius:"12px",textDecoration:"none",fontSize:"14px"}}>
                  ← Voltar à Lista
                </Link>
              </div>

              <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"20px"}}>
                <h3 style={{fontWeight:"700",fontSize:"14px",marginBottom:"14px"}}>Formas de Pagamento</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  <PayRow label="Recursos próprios" ok={true} />
                  <PayRow label="Aceita FGTS" ok={imovel.aceita_fgts} />
                  <PayRow label="Aceita Financiamento" ok={imovel.aceita_financiamento} />
                </div>
              </div>

              <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"20px"}}>
                <h3 style={{fontWeight:"700",fontSize:"14px",marginBottom:"14px"}}>Simulação de Financiamento</h3>
                <FinanciamentoSimulador valor={imovel.valor_leilao} />
              </div>

              <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"20px"}}>
                <h3 style={{fontWeight:"700",fontSize:"14px",marginBottom:"14px"}}>Compartilhar</h3>
                <div style={{display:"flex",gap:"8px"}}>
                  <a href={`https://wa.me/?text=Veja este imóvel com ${desconto}% de desconto: ${fmt(imovel.valor_leilao)} em ${imovel.cidade}-${imovel.estado} https://clever-raindrop-8346f0.netlify.app/imoveis/${imovel.codigo_caixa}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{flex:1,background:"#16a34a",color:"white",textAlign:"center",padding:"10px",borderRadius:"8px",textDecoration:"none",fontSize:"13px",fontWeight:"600"}}>
                    📱 WhatsApp
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=https://clever-raindrop-8346f0.netlify.app/imoveis/${imovel.codigo_caixa}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{flex:1,background:"#1d4ed8",color:"white",textAlign:"center",padding:"10px",borderRadius:"8px",textDecoration:"none",fontSize:"13px",fontWeight:"600"}}>
                    👤 Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function DestCard({ icon, label, value, cor }) {
  return (
    <div style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
      <div style={{fontSize:"22px",marginBottom:"4px"}}>{icon}</div>
      <div style={{color:"#6b6b80",fontSize:"11px",marginBottom:"4px"}}>{label}</div>
      <div style={{color:cor,fontWeight:"700",fontSize:"14px"}}>{value}</div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{background:"#18181f",borderRadius:"8px",padding:"12px"}}>
      <p style={{color:"#6b6b80",fontSize:"11px",marginBottom:"4px"}}>{icon} {label}</p>
      <p style={{color:"white",fontSize:"13px",fontWeight:"600",margin:0}}>{value}</p>
    </div>
  );
}

function RowInfo({ label, value }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #2a2a35",fontSize:"13px"}}>
      <span style={{color:"#6b6b80"}}>{label}</span>
      <span style={{color:"white",fontWeight:"500",textAlign:"right",maxWidth:"55%"}}>{value}</span>
    </div>
  );
}

function PayRow({ label, ok }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"13px"}}>
      <span style={{color:"#9ca3af"}}>{label}</span>
      {ok ? <span style={{color:"#4ade80",fontWeight:"600"}}>✔ Sim</span> : <span style={{color:"#f87171",fontWeight:"600"}}>✘ Não</span>}
    </div>
  );
}

function FinanciamentoSimulador({ valor }) {
  if (!valor) return null;
  const entrada = valor * 0.05;
  const financiado = valor - entrada;
  const parcela = (financiado * (0.008 * Math.pow(1.008, 360))) / (Math.pow(1.008, 360) - 1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"10px",fontSize:"13px"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{color:"#6b6b80"}}>Entrada (5%)</span>
        <span style={{color:"white"}}>R$ {Math.round(entrada).toLocaleString("pt-BR")}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{color:"#6b6b80"}}>Prazo</span>
        <span style={{color:"white"}}>30 anos</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{color:"#6b6b80"}}>Taxa</span>
        <span style={{color:"white"}}>~10% a.a.</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:"10px",borderTop:"1px solid #2a2a35"}}>
        <span style={{color:"#e5e7eb",fontWeight:"600"}}>Parcela aprox.</span>
        <span style={{color:"#f97316",fontWeight:"700"}}>R$ {parcela.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}/mês</span>
      </div>
    </div>
  );
}
