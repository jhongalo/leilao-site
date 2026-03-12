import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function fmt(val) {
  if (!val) return "—";
  return "R$ " + Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

export default async function Home() {
  const { data: maioresDescontos } = await supabase
    .from("imoveis")
    .select("*")
    .order("desconto", { ascending: false })
    .limit(6);

  const { data: menoresPrecos } = await supabase
    .from("imoveis")
    .select("*")
    .order("valor_leilao", { ascending: true })
    .limit(6);

  const { count } = await supabase
    .from("imoveis")
    .select("*", { count: "exact", head: true });

  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0f0f1a] py-24 px-4">
          <div className="absolute inset-0 opacity-20"
            style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 40%)'}} />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              {count?.toLocaleString("pt-BR") || "30.000+"} imóveis disponíveis
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Imóveis de Leilão com os<br />
              <span className="text-orange-500">Melhores Descontos</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Encontre oportunidades reais da Caixa Econômica Federal em todo o Brasil.
              Descontos de até 90% no valor de avaliação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/imoveis"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-orange-500/20">
                Buscar Imóveis →
              </Link>
              <Link href="/como-funciona"
                className="border border-[#2a2a35] hover:border-gray-500 text-gray-300 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
                Como Funciona
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="relative max-w-3xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Imóveis", value: count?.toLocaleString("pt-BR") || "30k+" },
              { label: "Desconto máx.", value: "90% OFF" },
              { label: "Aceita", value: "FGTS" },
              { label: "Em todo", value: "Brasil" },
            ].map((s) => (
              <div key={s.label} className="bg-[#111118] border border-[#2a2a35] rounded-xl p-4 text-center">
                <div className="text-2xl font-extrabold text-orange-500">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MAIORES DESCONTOS */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold">Maiores Descontos</h2>
              <p className="text-gray-500 mt-1">Os imóveis com maior percentual de desconto</p>
            </div>
            <Link href="/imoveis?order=desconto" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {maioresDescontos?.map((item) => <CardImovel key={item.codigo_caixa} item={item} />)}
          </div>
        </section>

        {/* MENORES PREÇOS */}
        <section className="max-w-7xl mx-auto px-4 py-8 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold">Menores Preços</h2>
              <p className="text-gray-500 mt-1">Os imóveis com os menores valores de venda</p>
            </div>
            <Link href="/imoveis?order=preco" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {menoresPrecos?.map((item) => <CardImovel key={item.codigo_caixa} item={item} />)}
          </div>
        </section>

        {/* POR QUE COMPRAR */}
        <section className="bg-[#111118] border-y border-[#2a2a35] py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-12">Por que Comprar em Leilão?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "💰", title: "Preços Abaixo do Mercado", desc: "Imóveis com descontos reais de 20% a 90% do valor de avaliação." },
                { icon: "🏦", title: "Transparência Total", desc: "Todos os imóveis são da Caixa Econômica Federal, com documentação oficial." },
                { icon: "📋", title: "Processo Seguro", desc: "Leilões regulamentados com edital público e regras claras." },
                { icon: "🤝", title: "Aceita Financiamento", desc: "Muitos imóveis aceitam FGTS e financiamento pela própria Caixa." },
              ].map((item) => (
                <div key={item.title} className="bg-[#18181f] border border-[#2a2a35] rounded-xl p-6 hover:border-orange-500/30 transition-colors">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-4">Pronto para Encontrar seu Imóvel?</h2>
            <p className="text-gray-400 mb-8">Explore milhares de oportunidades em todo o Brasil agora mesmo.</p>
            <Link href="/imoveis"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-orange-500/20">
              Buscar Imóveis →
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#111118] border-t border-[#2a2a35] py-10 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>
              Leilão<span className="text-orange-500">Fácil</span>
            </div>
            <p>© 2026 LeilãoFácil · Todos os direitos reservados</p>
            <p>Este não é um site oficial da Caixa Econômica Federal</p>
          </div>
        </footer>
      </main>
    </>
  );
}

function CardImovel({ item }) {
  const desconto = item.desconto || (item.valor_avaliacao && item.valor_leilao
    ? Math.round((1 - item.valor_leilao / item.valor_avaliacao) * 100)
    : 0);

  const foto = Array.isArray(item.fotos) ? item.fotos[0] : item.fotos;
  const fotoFinal = foto && foto.startsWith("http") ? foto : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600";

  return (
    <Link href={`/imoveis/${item.codigo_caixa}`} className="card-imovel block bg-[#111118] border border-[#2a2a35] rounded-xl overflow-hidden hover:border-orange-500/40">
      <div className="relative h-48 overflow-hidden bg-[#18181f]">
        <img
          src={fotoFinal}
          alt={item.titulo}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"; }}
        />
        {desconto > 0 && (
          <span className="badge-desconto absolute top-3 left-3 text-white text-xs px-2 py-1 rounded-full">
            {desconto}% OFF
          </span>
        )}
        {item.tipo_imovel && (
          <span className="absolute top-3 right-3 bg-black/60 text-gray-200 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {item.tipo_imovel}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{item.titulo}</h3>
        <p className="text-gray-500 text-xs mb-3">
          {[item.bairro, item.cidade, item.estado].filter(Boolean).join(", ")}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-orange-500 font-extrabold text-lg">{fmt(item.valor_leilao)}</div>
            {item.valor_avaliacao > 0 && (
              <div className="text-gray-600 text-xs line-through">{fmt(item.valor_avaliacao)}</div>
            )}
          </div>
          <div className="flex gap-1">
            {item.aceita_fgts && <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded border border-green-800">FGTS</span>}
            {item.aceita_financiamento && <span className="bg-blue-900/40 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-800">Fin.</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
