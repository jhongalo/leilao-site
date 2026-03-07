import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function fmt(val) {
  if (!val) return "—";
  return "R$ " + Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function ImovelPage({ params }) {
  const codigo = decodeURIComponent(params.codigo);
  const { data: imovel } = await supabase
    .from("imoveis")
    .select("*")
    .eq("codigo_caixa", codigo)
    .single();

  if (!imovel) notFound();

  const desconto = imovel.desconto || (imovel.valor_avaliacao && imovel.valor_leilao
    ? Math.round((1 - imovel.valor_leilao / imovel.valor_avaliacao) * 100) : 0);

  const fotos = Array.isArray(imovel.fotos)
    ? imovel.fotos.filter(f => f && typeof f === "string" && f.startsWith("http"))
    : [];
  const fotoFinal = fotos[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";

  // Imóveis similares
  const { data: similares } = await supabase
    .from("imoveis")
    .select("*")
    .eq("estado", imovel.estado)
    .neq("codigo_caixa", imovel.codigo_caixa)
    .limit(3);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>›</span>
            <Link href="/imoveis" className="hover:text-white transition-colors">Imóveis</Link>
            <span>›</span>
            <span className="text-white line-clamp-1">{imovel.titulo}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* COLUNA ESQUERDA */}
            <div className="lg:col-span-2 space-y-6">

              {/* Título */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {imovel.titulo?.toUpperCase()}
                </h1>
                <p className="text-gray-400 mt-2 flex items-center gap-1">
                  <span>📍</span>
                  {[imovel.endereco, imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Fotos */}
              <div className="bg-[#111118] border border-[#2a2a35] rounded-xl overflow-hidden">
                <div className="relative h-64 md:h-96 bg-[#18181f]">
                  <img
                    src={fotoFinal}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover"
                    onError={`this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'`}
                  />
                  {desconto > 0 && (
                    <span className="badge-desconto absolute top-4 left-4 text-white text-sm px-3 py-1.5 rounded-full font-bold">
                      {desconto}% OFF
                    </span>
                  )}
                </div>
                {fotos.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {fotos.map((f, i) => (
                      <img key={i} src={f} alt="" className="h-16 w-24 object-cover rounded-lg border border-[#2a2a35] shrink-0 cursor-pointer hover:border-orange-500 transition-colors" />
                    ))}
                  </div>
                )}
              </div>

              {/* Sobre o imóvel */}
              <div className="bg-[#111118] border border-[#2a2a35] rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Sobre este imóvel</h2>
                {imovel.descricao && imovel.descricao !== "." && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{imovel.descricao}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imovel.tipo_imovel && <InfoItem icon="🏠" label="Tipo" value={imovel.tipo_imovel} />}
                  {imovel.modalidade && <InfoItem icon="📋" label="Modalidade" value={imovel.modalidade} />}
                  {imovel.situacao && <InfoItem icon="🔑" label="Situação" value={imovel.situacao} />}
                  {imovel.estado && <InfoItem icon="🗺️" label="Estado" value={imovel.estado} />}
                  {imovel.cidade && <InfoItem icon="🏙️" label="Cidade" value={imovel.cidade} />}
                  {imovel.bairro && <InfoItem icon="📍" label="Bairro" value={imovel.bairro} />}
                </div>
              </div>

              {/* Localização */}
              <div className="bg-[#111118] border border-[#2a2a35] rounded-xl p-6">
                <h2 className="text-xl font-bold mb-3">Localização</h2>
                <p className="text-gray-400 text-sm">
                  📍 {[imovel.endereco, imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(", ")}
                  {imovel.cep && ` · CEP: ${imovel.cep}`}
                </p>
              </div>

              {/* Imóveis similares */}
              {similares && similares.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Imóveis Similares em {imovel.estado}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {similares.map(s => {
                      const sfoto = Array.isArray(s.fotos) ? s.fotos[0] : s.fotos;
                      const sfotoFinal = sfoto && typeof sfoto === "string" && sfoto.startsWith("http") ? sfoto : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
                      return (
                        <Link key={s.codigo_caixa} href={`/imoveis/${s.codigo_caixa}`}
                          className="bg-[#111118] border border-[#2a2a35] rounded-xl overflow-hidden hover:border-orange-500/40 transition-colors">
                          <img src={sfotoFinal} alt={s.titulo} className="w-full h-32 object-cover" />
                          <div className="p-3">
                            <p className="text-sm font-semibold line-clamp-1">{s.titulo}</p>
                            <p className="text-orange-500 text-sm font-bold mt-1">{fmt(s.valor_leilao)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* COLUNA DIREITA — sidebar */}
            <div className="space-y-5">

              {/* Preço */}
              <div className="bg-[#111118] border border-[#2a2a35] rounded-xl p-6 sticky top-20">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-white">{fmt(imovel.valor_leilao)}</span>
                  {desconto > 0 && (
                    <span className="badge-desconto text-white text-sm px-2 py-0.5 rounded-full">{desconto}% OFF</span>
                  )}
                </div>
                {imovel.valor_avaliacao > 0 && (
                  <p className="text-gray-500 text-sm line-through mb-4">Avaliação: {fmt(imovel.valor_avaliacao)}</p>
                )}

                <div className="space-y-2 text-sm mb-5">
                  {imovel.modalidade && <Row label="Modalidade" value={imovel.modalidade} />}
                  {imovel.valor_avaliacao > 0 && <Row label="Valor de Avaliação" value={fmt(imovel.valor_avaliacao)} />}
                </div>

                <a href={imovel.link_imovel_caixa} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-bold py-3 rounded-xl transition-colors mb-3">
                  🔗 Consultar Imóvel
                </a>
                <Link href="/imoveis"
                  className="block w-full bg-[#18181f] border border-[#2a2a35] hover:border-gray-500 text-gray-300 text-center font-medium py-3 rounded-xl transition-colors text-sm">
                  ← Voltar à Lista
                </Link>

                {/* Formas de pagamento */}
                <div className="mt-6 pt-6 border-t border-[#2a2a35]">
                  <h3 className="font-bold text-sm mb-3">Formas de Pagamento</h3>
                  <div className="space-y-2">
                    <PayRow label="Recursos próprios" ok={true} />
                    <PayRow label="Aceita FGTS" ok={imovel.aceita_fgts} />
                    <PayRow label="Aceita Financiamento" ok={imovel.aceita_financiamento} />
                  </div>
                </div>

                {/* Simulação */}
                <div className="mt-6 pt-6 border-t border-[#2a2a35]">
                  <h3 className="font-bold text-sm mb-3">Simulação de Financiamento</h3>
                  <FinanciamentoSimulador valor={imovel.valor_leilao} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="bg-[#18181f] rounded-lg p-3">
      <p className="text-gray-500 text-xs mb-1">{icon} {label}</p>
      <p className="text-white text-sm font-semibold">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a35]">
      <span className="text-gray-500">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}

function PayRow({ label, ok }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      {ok ? (
        <span className="text-green-400 font-medium">✓ Sim</span>
      ) : (
        <span className="text-red-400 font-medium">✕ Não</span>
      )}
    </div>
  );
}

function FinanciamentoSimulador({ valor }) {
  if (!valor) return null;
  const entrada = valor * 0.05;
  const financiado = valor - entrada;
  const parcela = (financiado * (0.008 * Math.pow(1.008, 360))) / (Math.pow(1.008, 360) - 1);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Entrada (5%)</span>
        <span className="text-white">R$ {entrada.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Prazo</span>
        <span className="text-white">30 anos</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Taxa</span>
        <span className="text-white">~10% a.a.</span>
      </div>
      <div className="flex justify-between pt-2 border-t border-[#2a2a35]">
        <span className="text-gray-300 font-medium">Parcela aprox.</span>
        <span className="text-orange-500 font-bold">R$ {parcela.toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}/mês</span>
      </div>
    </div>
  );
}
