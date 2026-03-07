"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Navbar from "../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TIPOS = ["Apartamento","Casa","Comercial","Gleba","Loja","Lote","Prédio","Sala","Terreno"];
const MODALIDADES = ["Leilão SFI","Licitação aberta","Venda Online","Compra Direta","Venda Direta Online"];
const PER_PAGE = 24;

function fmt(val) {
  if (!val) return "—";
  return "R$ " + Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados para filtros
  const [estados, setEstados] = useState([]);
  const [estadoSel, setEstadoSel] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [cidadeSel, setCidadeSel] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [bairroSel, setBairroSel] = useState([]);

  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(10000000);
  const [descontoMin, setDescontoMin] = useState(0);
  const [descontoMax, setDescontoMax] = useState(100);

  const [tiposSel, setTiposSel] = useState([]);
  const [modalidadesSel, setModalidadesSel] = useState([]);

  const [aceitaFgts, setAceitaFgts] = useState(false);
  const [aceitaFin, setAceitaFin] = useState(false);

  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(500);

  const [ordenar, setOrdenar] = useState("desconto_desc");
  const [busca, setBusca] = useState("");

  // Carrega estados únicos
  useEffect(() => {
    supabase.from("imoveis").select("estado").then(({ data }) => {
      const unicos = [...new Set(data?.map(d => d.estado).filter(Boolean))].sort();
      setEstados(unicos);
    });
  }, []);

  // Carrega cidades quando estado muda
  useEffect(() => {
    if (estadoSel.length === 0) { setCidades([]); setCidadeSel([]); return; }
    let q = supabase.from("imoveis").select("cidade");
    estadoSel.forEach(e => { q = q.eq("estado", e); });
    q.then(({ data }) => {
      const unicos = [...new Set(data?.map(d => d.cidade).filter(Boolean))].sort();
      setCidades(unicos);
    });
  }, [estadoSel]);

  // Carrega bairros quando cidade muda
  useEffect(() => {
    if (cidadeSel.length === 0) { setBairros([]); setBairroSel([]); return; }
    let q = supabase.from("imoveis").select("bairro");
    cidadeSel.forEach(c => { q = q.eq("cidade", c); });
    q.then(({ data }) => {
      const unicos = [...new Set(data?.map(d => d.bairro).filter(Boolean))].sort();
      setBairros(unicos);
    });
  }, [cidadeSel]);

  const buscarImoveis = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("imoveis").select("*", { count: "exact" });

    if (busca) q = q.or(`titulo.ilike.%${busca}%,cidade.ilike.%${busca}%,bairro.ilike.%${busca}%,endereco.ilike.%${busca}%`);
    if (estadoSel.length > 0) q = q.in("estado", estadoSel);
    if (cidadeSel.length > 0) q = q.in("cidade", cidadeSel);
    if (bairroSel.length > 0) q = q.in("bairro", bairroSel);
    if (tiposSel.length > 0) q = q.in("tipo_imovel", tiposSel);
    if (modalidadesSel.length > 0) q = q.in("modalidade", modalidadesSel);
    if (aceitaFgts) q = q.eq("aceita_fgts", true);
    if (aceitaFin) q = q.eq("aceita_financiamento", true);
    if (precoMin > 0) q = q.gte("valor_leilao", precoMin);
    if (precoMax < 10000000) q = q.lte("valor_leilao", precoMax);
    if (descontoMin > 0) q = q.gte("desconto", descontoMin);
    if (descontoMax < 100) q = q.lte("desconto", descontoMax);

    // Ordenação
    if (ordenar === "desconto_desc") q = q.order("desconto", { ascending: false });
    else if (ordenar === "preco_asc") q = q.order("valor_leilao", { ascending: true });
    else if (ordenar === "preco_desc") q = q.order("valor_leilao", { ascending: false });
    else if (ordenar === "recente") q = q.order("created_at", { ascending: false });

    q = q.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, count, error } = await q;
    if (!error) { setImoveis(data || []); setTotal(count || 0); }
    setLoading(false);
  }, [busca, estadoSel, cidadeSel, bairroSel, tiposSel, modalidadesSel, aceitaFgts, aceitaFin, precoMin, precoMax, descontoMin, descontoMax, page, ordenar]);

  useEffect(() => { buscarImoveis(); }, [buscarImoveis]);

  function limparFiltros() {
    setEstadoSel([]); setCidadeSel([]); setBairroSel([]);
    setPrecoMin(0); setPrecoMax(10000000);
    setDescontoMin(0); setDescontoMax(100);
    setTiposSel([]); setModalidadesSel([]);
    setAceitaFgts(false); setAceitaFin(false);
    setAreaMin(0); setAreaMax(500);
    setBusca(""); setPage(1);
  }

  function toggleArr(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    setPage(1);
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  const Sidebar = () => (
    <aside className="w-72 shrink-0 bg-[#111118] border border-[#2a2a35] rounded-xl p-5 space-y-6 h-fit sticky top-20">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">Filtros</h2>
        <button onClick={limparFiltros} className="text-orange-500 text-xs hover:underline">Limpar</button>
      </div>

      {/* Busca */}
      <div>
        <input
          value={busca}
          onChange={e => { setBusca(e.target.value); setPage(1); }}
          placeholder="Cidade, bairro ou título..."
          className="w-full bg-[#18181f] border border-[#2a2a35] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Localização */}
      <FiltroSection title="Localização">
        <SelectMulti label="Estado" opcoes={estados} selecionados={estadoSel} onChange={v => { toggleArr(estadoSel, setEstadoSel, v); }} />
        {cidadeSel.length > 0 || estadoSel.length > 0 ? (
          <SelectMulti label="Cidade" opcoes={cidades} selecionados={cidadeSel} onChange={v => toggleArr(cidadeSel, setCidadeSel, v)} />
        ) : null}
        {cidadeSel.length > 0 && bairros.length > 0 ? (
          <SelectMulti label="Bairro" opcoes={bairros} selecionados={bairroSel} onChange={v => toggleArr(bairroSel, setBairroSel, v)} />
        ) : null}
      </FiltroSection>

      {/* Preço */}
      <FiltroSection title="Preço de Venda">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="number" placeholder="Mín" value={precoMin || ""}
              onChange={e => { setPrecoMin(Number(e.target.value)); setPage(1); }}
              className="w-1/2 bg-[#18181f] border border-[#2a2a35] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500" />
            <input type="number" placeholder="Máx" value={precoMax === 10000000 ? "" : precoMax}
              onChange={e => { setPrecoMax(Number(e.target.value) || 10000000); setPage(1); }}
              className="w-1/2 bg-[#18181f] border border-[#2a2a35] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500" />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {fmt(precoMin)} — {precoMax >= 10000000 ? "R$ 10.000.000+" : fmt(precoMax)}
          </div>
        </div>
      </FiltroSection>

      {/* Desconto */}
      <FiltroSection title="Desconto">
        <div className="space-y-2">
          <input type="range" min={0} max={100} value={descontoMin}
            onChange={e => { setDescontoMin(Number(e.target.value)); setPage(1); }} />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Mín: {descontoMin}%</span>
            <span>Máx: {descontoMax}%</span>
          </div>
          <input type="range" min={0} max={100} value={descontoMax}
            onChange={e => { setDescontoMax(Number(e.target.value)); setPage(1); }} />
        </div>
      </FiltroSection>

      {/* Tipo de Imóvel */}
      <FiltroSection title="Tipo de Imóvel">
        <div className="grid grid-cols-2 gap-1.5">
          {TIPOS.map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={tiposSel.includes(t)} onChange={() => toggleArr(tiposSel, setTiposSel, t)}
                className="custom-check rounded" />
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{t}</span>
            </label>
          ))}
        </div>
      </FiltroSection>

      {/* Modalidade */}
      <FiltroSection title="Modalidade">
        <div className="space-y-1.5">
          {MODALIDADES.map(m => (
            <label key={m} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={modalidadesSel.includes(m)} onChange={() => toggleArr(modalidadesSel, setModalidadesSel, m)}
                className="custom-check rounded" />
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{m}</span>
            </label>
          ))}
        </div>
      </FiltroSection>

      {/* Condições */}
      <FiltroSection title="Condições">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={aceitaFgts} onChange={e => { setAceitaFgts(e.target.checked); setPage(1); }} className="custom-check rounded" />
          <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Aceita FGTS</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group mt-2">
          <input type="checkbox" checked={aceitaFin} onChange={e => { setAceitaFin(e.target.checked); setPage(1); }} className="custom-check rounded" />
          <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Aceita Financiamento</span>
        </label>
      </FiltroSection>

      {/* Área */}
      <FiltroSection title="Área (m²)">
        <div className="space-y-2">
          <input type="range" min={0} max={500} value={areaMin}
            onChange={e => { setAreaMin(Number(e.target.value)); setPage(1); }} />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{areaMin} m²</span>
            <span>{areaMax === 500 ? "500+ m²" : `${areaMax} m²`}</span>
          </div>
          <input type="range" min={0} max={500} value={areaMax}
            onChange={e => { setAreaMax(Number(e.target.value)); setPage(1); }} />
        </div>
      </FiltroSection>

      <button onClick={buscarImoveis}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
        Aplicar Filtros
      </button>
    </aside>
  );

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold">Encontre seu Imóvel</h1>
              <p className="text-gray-500 text-sm mt-1">
                {total.toLocaleString("pt-BR")} imóveis disponíveis · Página {page} de {totalPages || 1}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden bg-[#111118] border border-[#2a2a35] text-sm px-4 py-2 rounded-lg">
                Filtros
              </button>
              <select value={ordenar} onChange={e => { setOrdenar(e.target.value); setPage(1); }}
                className="bg-[#111118] border border-[#2a2a35] text-sm px-3 py-2 rounded-lg text-white focus:outline-none focus:border-orange-500">
                <option value="desconto_desc">Maior desconto</option>
                <option value="preco_asc">Menor preço</option>
                <option value="preco_desc">Maior preço</option>
                <option value="recente">Mais recentes</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar desktop */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Sidebar mobile */}
            {sidebarOpen && (
              <div className="md:hidden fixed inset-0 z-50 bg-black/70 overflow-y-auto p-4">
                <div className="relative">
                  <button onClick={() => setSidebarOpen(false)}
                    className="absolute top-2 right-2 text-gray-400 text-xl z-10">✕</button>
                  <Sidebar />
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-[#111118] border border-[#2a2a35] rounded-xl overflow-hidden animate-pulse">
                      <div className="h-48 bg-[#18181f]" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-[#18181f] rounded w-3/4" />
                        <div className="h-3 bg-[#18181f] rounded w-1/2" />
                        <div className="h-5 bg-[#18181f] rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : imoveis.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-lg">Nenhum imóvel encontrado com esses filtros.</p>
                  <button onClick={limparFiltros} className="mt-4 text-orange-500 hover:underline text-sm">Limpar filtros</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {imoveis.map((item) => <CardImovel key={item.codigo_caixa} item={item} />)}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="px-4 py-2 bg-[#111118] border border-[#2a2a35] rounded-lg text-sm disabled:opacity-40 hover:border-gray-500 transition-colors">
                        ← Anterior
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-orange-500 text-white" : "bg-[#111118] border border-[#2a2a35] hover:border-gray-500"}`}>
                            {p}
                          </button>
                        );
                      })}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="px-4 py-2 bg-[#111118] border border-[#2a2a35] rounded-lg text-sm disabled:opacity-40 hover:border-gray-500 transition-colors">
                        Próxima →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function FiltroSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-[#2a2a35] pt-4">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-sm font-semibold text-white mb-3">
        {title}
        <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function SelectMulti({ label, opcoes, selecionados, onChange }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
        {opcoes.length === 0 && <p className="text-xs text-gray-600 italic">Nenhuma opção</p>}
        {opcoes.map(op => (
          <label key={op} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={selecionados.includes(op)} onChange={() => onChange(op)} className="custom-check rounded" />
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors truncate">{op}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CardImovel({ item }) {
  const desconto = item.desconto || (item.valor_avaliacao && item.valor_leilao
    ? Math.round((1 - item.valor_leilao / item.valor_avaliacao) * 100) : 0);

  const foto = Array.isArray(item.fotos) ? item.fotos[0] : item.fotos;
  const fotoFinal = foto && typeof foto === "string" && foto.startsWith("http")
    ? foto : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600";

  return (
    <Link href={`/imoveis/${item.codigo_caixa}`} className="card-imovel block bg-[#111118] border border-[#2a2a35] rounded-xl overflow-hidden hover:border-orange-500/40">
      <div className="relative h-48 bg-[#18181f] overflow-hidden">
        <img src={fotoFinal} alt={item.titulo} className="w-full h-full object-cover"
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"; }} />
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
          📍 {[item.bairro, item.cidade, item.estado].filter(Boolean).join(", ")}
        </p>
        {item.descricao && item.descricao !== "." && (
          <p className="text-gray-600 text-xs line-clamp-2 mb-3">{item.descricao}</p>
        )}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-orange-500 font-extrabold text-lg">{fmt(item.valor_leilao)}</div>
            {item.valor_avaliacao > 0 && (
              <div className="text-gray-600 text-xs line-through">{fmt(item.valor_avaliacao)}</div>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            {item.aceita_fgts && <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded border border-green-800">FGTS</span>}
            {item.aceita_financiamento && <span className="bg-blue-900/40 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-800">Financ.</span>}
          </div>
        </div>
        {item.modalidade && (
          <div className="mt-3 pt-3 border-t border-[#2a2a35]">
            <span className="text-gray-600 text-xs">{item.modalidade}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
