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
  if (!val && val !== 0) return "—";
  return "R$ " + Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [estados, setEstados] = useState([]);
  const [estadoSel, setEstadoSel] = useState([]);
  const [estadoInput, setEstadoInput] = useState("");
  const [cidades, setCidades] = useState([]);
  const [cidadeSel, setCidadeSel] = useState([]);
  const [cidadeInput, setCidadeInput] = useState("");
  const [bairros, setBairros] = useState([]);
  const [bairroSel, setBairroSel] = useState([]);
  const [bairroInput, setBairroInput] = useState("");

  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [descontoMin, setDescontoMin] = useState(0);
  const [descontoMax, setDescontoMax] = useState(100);

  const [tiposSel, setTiposSel] = useState([]);
  const [modalidadesSel, setModalidadesSel] = useState([]);

  const [aceitaFgts, setAceitaFgts] = useState(false);
  const [aceitaFin, setAceitaFin] = useState(false);
  const [emDisputa, setEmDisputa] = useState(false);

  const [condCondominio, setCondCondominio] = useState("");
  const [condIptu, setCondIptu] = useState("");

  const [dataLeilao, setDataLeilao] = useState("");

  const [tipoArea, setTipoArea] = useState("Privativa");
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(500);

  const [ordenar, setOrdenar] = useState("desconto_desc");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    supabase.from("imoveis").select("estado").then(({ data }) => {
      const unicos = [...new Set(data?.map(d => d.estado).filter(Boolean))].sort();
      setEstados(unicos);
    });
  }, []);

  useEffect(() => {
    if (estadoSel.length === 0) { setCidades([]); setCidadeSel([]); return; }
    supabase.from("imoveis").select("cidade").in("estado", estadoSel).then(({ data }) => {
      const unicos = [...new Set(data?.map(d => d.cidade).filter(Boolean))].sort();
      setCidades(unicos);
    });
  }, [estadoSel]);

  useEffect(() => {
    if (cidadeSel.length === 0) { setBairros([]); setBairroSel([]); return; }
    supabase.from("imoveis").select("bairro").in("cidade", cidadeSel).then(({ data }) => {
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
    if (precoMin !== "") q = q.gte("valor_leilao", Number(precoMin));
    if (precoMax !== "") q = q.lte("valor_leilao", Number(precoMax));
    if (descontoMin > 0) q = q.gte("desconto", descontoMin);
    if (descontoMax < 100) q = q.lte("desconto", descontoMax);
    if (dataLeilao) q = q.lte("data_leilao", dataLeilao);

    if (ordenar === "desconto_desc") q = q.order("desconto", { ascending: false });
    else if (ordenar === "preco_asc") q = q.order("valor_leilao", { ascending: true });
    else if (ordenar === "preco_desc") q = q.order("valor_leilao", { ascending: false });
    else if (ordenar === "data_asc") q = q.order("data_leilao", { ascending: true });
    else if (ordenar === "data_desc") q = q.order("data_leilao", { ascending: false });
    else if (ordenar === "recente") q = q.order("created_at", { ascending: false });

    q = q.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, count, error } = await q;
    if (!error) { setImoveis(data || []); setTotal(count || 0); }
    setLoading(false);
  }, [busca, estadoSel, cidadeSel, bairroSel, tiposSel, modalidadesSel, aceitaFgts, aceitaFin, precoMin, precoMax, descontoMin, descontoMax, page, ordenar, dataLeilao]);

  useEffect(() => { buscarImoveis(); }, [buscarImoveis]);

  function limparFiltros() {
    setEstadoSel([]); setCidadeSel([]); setBairroSel([]);
    setPrecoMin(""); setPrecoMax("");
    setDescontoMin(0); setDescontoMax(100);
    setTiposSel([]); setModalidadesSel([]);
    setAceitaFgts(false); setAceitaFin(false); setEmDisputa(false);
    setCondCondominio(""); setCondIptu("");
    setDataLeilao(""); setTipoArea("Privativa");
    setAreaMin(0); setAreaMax(500);
    setBusca(""); setPage(1);
  }

  function toggleArr(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    setPage(1);
  }

  function addTag(arr, setArr, val, setInput) {
    if (val && !arr.includes(val)) { setArr([...arr, val]); }
    setInput("");
    setPage(1);
  }

  function removeTag(arr, setArr, val) {
    setArr(arr.filter(x => x !== val));
    setPage(1);
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  const Sidebar = () => (
    <aside style={{width:"280px",minWidth:"280px",background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",padding:"20px",height:"fit-content",position:"sticky",top:"80px",overflowY:"auto",maxHeight:"calc(100vh - 100px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <h2 style={{fontWeight:"700",fontSize:"16px",margin:0}}>Filtros</h2>
      </div>

      {/* Localização */}
      <FiltroSection title="Localização">
        {/* Estados */}
        <div style={{marginBottom:"10px"}}>
          <label style={{fontSize:"11px",color:"#6b6b80",display:"block",marginBottom:"4px"}}>Estados</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>
            {estadoSel.map(e => (
              <span key={e} style={{background:"#f97316",color:"white",fontSize:"11px",padding:"2px 8px",borderRadius:"20px",display:"flex",alignItems:"center",gap:"4px"}}>
                {e} <button onClick={() => removeTag(estadoSel, setEstadoSel, e)} style={{background:"none",border:"none",color:"white",cursor:"pointer",padding:0,fontSize:"12px"}}>×</button>
              </span>
            ))}
          </div>
          <select onChange={e => { if(e.target.value) addTag(estadoSel, setEstadoSel, e.target.value, ()=>{}); e.target.value=""; }}
            style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 10px",color:"#9ca3af",fontSize:"12px",outline:"none"}}>
            <option value="">Adicionar estado</option>
            {estados.filter(e => !estadoSel.includes(e)).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Cidades */}
        <div style={{marginBottom:"10px"}}>
          <label style={{fontSize:"11px",color:"#6b6b80",display:"block",marginBottom:"4px"}}>Cidades</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>
            {cidadeSel.map(c => (
              <span key={c} style={{background:"#f97316",color:"white",fontSize:"11px",padding:"2px 8px",borderRadius:"20px",display:"flex",alignItems:"center",gap:"4px"}}>
                {c} <button onClick={() => removeTag(cidadeSel, setCidadeSel, c)} style={{background:"none",border:"none",color:"white",cursor:"pointer",padding:0,fontSize:"12px"}}>×</button>
              </span>
            ))}
          </div>
          <select onChange={e => { if(e.target.value) addTag(cidadeSel, setCidadeSel, e.target.value, ()=>{}); e.target.value=""; }}
            style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 10px",color:"#9ca3af",fontSize:"12px",outline:"none"}}
            disabled={estadoSel.length === 0}>
            <option value="">{estadoSel.length === 0 ? "Selecione um estado" : "Adicionar cidade"}</option>
            {cidades.filter(c => !cidadeSel.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Bairros */}
        <div>
          <label style={{fontSize:"11px",color:"#6b6b80",display:"block",marginBottom:"4px"}}>Bairros</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>
            {bairroSel.map(b => (
              <span key={b} style={{background:"#f97316",color:"white",fontSize:"11px",padding:"2px 8px",borderRadius:"20px",display:"flex",alignItems:"center",gap:"4px"}}>
                {b} <button onClick={() => removeTag(bairroSel, setBairroSel, b)} style={{background:"none",border:"none",color:"white",cursor:"pointer",padding:0,fontSize:"12px"}}>×</button>
              </span>
            ))}
          </div>
          <select onChange={e => { if(e.target.value) addTag(bairroSel, setBairroSel, e.target.value, ()=>{}); e.target.value=""; }}
            style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 10px",color:"#9ca3af",fontSize:"12px",outline:"none"}}
            disabled={cidadeSel.length === 0}>
            <option value="">{cidadeSel.length === 0 ? "Selecione uma cidade" : "Adicionar bairro"}</option>
            {bairros.filter(b => !bairroSel.includes(b)).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </FiltroSection>

      {/* Preço */}
      <FiltroSection title="Preço de venda">
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
          <div style={{flex:1}}>
            <label style={{fontSize:"10px",color:"#6b6b80",display:"block",marginBottom:"3px"}}>Valor mínimo</label>
            <input type="number" placeholder="R$ 0" value={precoMin}
              onChange={e => { setPrecoMin(e.target.value); setPage(1); }}
              style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 8px",color:"white",fontSize:"12px",outline:"none"}} />
          </div>
          <div style={{flex:1}}>
            <label style={{fontSize:"10px",color:"#6b6b80",display:"block",marginBottom:"3px"}}>Valor máximo</label>
            <input type="number" placeholder="R$ 10M" value={precoMax}
              onChange={e => { setPrecoMax(e.target.value); setPage(1); }}
              style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 8px",color:"white",fontSize:"12px",outline:"none"}} />
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#6b6b80"}}>
          <span>{precoMin ? fmt(precoMin) : "R$ 0,00"}</span>
          <span>{precoMax ? fmt(precoMax) : "R$ 10.000.000,00"}</span>
        </div>
      </FiltroSection>

      {/* Desconto */}
      <FiltroSection title="Desconto">
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
          <div style={{flex:1}}>
            <label style={{fontSize:"10px",color:"#6b6b80",display:"block",marginBottom:"3px"}}>Desconto mínimo</label>
            <input type="number" min={0} max={100} value={descontoMin}
              onChange={e => { setDescontoMin(Number(e.target.value)); setPage(1); }}
              style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 8px",color:"white",fontSize:"12px",outline:"none"}} />
          </div>
          <div style={{flex:1}}>
            <label style={{fontSize:"10px",color:"#6b6b80",display:"block",marginBottom:"3px"}}>Desconto máximo</label>
            <input type="number" min={0} max={100} value={descontoMax}
              onChange={e => { setDescontoMax(Number(e.target.value)); setPage(1); }}
              style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 8px",color:"white",fontSize:"12px",outline:"none"}} />
          </div>
        </div>
        <input type="range" min={0} max={100} value={descontoMin}
          onChange={e => { setDescontoMin(Number(e.target.value)); setPage(1); }}
          style={{width:"100%",accentColor:"#f97316",marginBottom:"4px"}} />
        <input type="range" min={0} max={100} value={descontoMax}
          onChange={e => { setDescontoMax(Number(e.target.value)); setPage(1); }}
          style={{width:"100%",accentColor:"#f97316"}} />
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#6b6b80",marginTop:"4px"}}>
          <span>{descontoMin}%</span>
          <span>{descontoMax}%</span>
        </div>
      </FiltroSection>

      {/* Tipo de Imóvel */}
      <FiltroSection title="Tipo de Imóvel">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
          {TIPOS.map(t => (
            <label key={t} style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
              <input type="checkbox" checked={tiposSel.includes(t)} onChange={() => toggleArr(tiposSel, setTiposSel, t)}
                style={{accentColor:"#f97316",cursor:"pointer"}} />
              <span style={{fontSize:"12px",color: tiposSel.includes(t) ? "white" : "#9ca3af"}}>{t}</span>
            </label>
          ))}
        </div>
      </FiltroSection>

      {/* Modalidade */}
      <FiltroSection title="Modalidade">
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {MODALIDADES.map(m => (
            <label key={m} style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
              <input type="checkbox" checked={modalidadesSel.includes(m)} onChange={() => toggleArr(modalidadesSel, setModalidadesSel, m)}
                style={{accentColor:"#f97316",cursor:"pointer"}} />
              <span style={{fontSize:"12px",color: modalidadesSel.includes(m) ? "white" : "#9ca3af"}}>{m}</span>
            </label>
          ))}
        </div>
      </FiltroSection>

      {/* Condições */}
      <FiltroSection title="Condições">
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          <label style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
            <input type="checkbox" checked={aceitaFgts} onChange={e => { setAceitaFgts(e.target.checked); setPage(1); }}
              style={{accentColor:"#f97316",cursor:"pointer"}} />
            <span style={{fontSize:"12px",color: aceitaFgts ? "white" : "#9ca3af"}}>Aceita FGTS</span>
          </label>
          <label style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
            <input type="checkbox" checked={aceitaFin} onChange={e => { setAceitaFin(e.target.checked); setPage(1); }}
              style={{accentColor:"#f97316",cursor:"pointer"}} />
            <span style={{fontSize:"12px",color: aceitaFin ? "white" : "#9ca3af"}}>Aceita Financiamento</span>
          </label>
          <label style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
            <input type="checkbox" checked={emDisputa} onChange={e => { setEmDisputa(e.target.checked); setPage(1); }}
              style={{accentColor:"#f97316",cursor:"pointer"}} />
            <span style={{fontSize:"12px",color: emDisputa ? "white" : "#9ca3af"}}>Imóveis em disputa</span>
          </label>
        </div>
      </FiltroSection>

      {/* Despesas de Condomínio */}
      <FiltroSection title="Despesas de Condomínio">
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {["Limitada a 10%","Arrematante paga"].map(op => (
            <label key={op} style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
              <input type="radio" name="condominio" value={op} checked={condCondominio === op}
                onChange={() => setCondCondominio(condCondominio === op ? "" : op)}
                style={{accentColor:"#f97316",cursor:"pointer"}} />
              <span style={{fontSize:"12px",color: condCondominio === op ? "white" : "#9ca3af"}}>{op}</span>
            </label>
          ))}
        </div>
      </FiltroSection>

      {/* Despesas de IPTU */}
      <FiltroSection title="Despesas de IPTU">
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {["Caixa paga","Arrematante paga"].map(op => (
            <label key={op} style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
              <input type="radio" name="iptu" value={op} checked={condIptu === op}
                onChange={() => setCondIptu(condIptu === op ? "" : op)}
                style={{accentColor:"#f97316",cursor:"pointer"}} />
              <span style={{fontSize:"12px",color: condIptu === op ? "white" : "#9ca3af"}}>{op}</span>
            </label>
          ))}
        </div>
      </FiltroSection>

      {/* Data Leilão */}
      <FiltroSection title="Data Leilão">
        <label style={{fontSize:"11px",color:"#6b6b80",display:"block",marginBottom:"4px"}}>Encerra até</label>
        <input type="date" value={dataLeilao} onChange={e => { setDataLeilao(e.target.value); setPage(1); }}
          style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 10px",color: dataLeilao ? "white" : "#6b6b80",fontSize:"12px",outline:"none",colorScheme:"dark"}} />
      </FiltroSection>

      {/* Área */}
      <FiltroSection title="Área">
        <div style={{marginBottom:"8px"}}>
          <label style={{fontSize:"11px",color:"#6b6b80",display:"block",marginBottom:"4px"}}>Tipo de área</label>
          <select value={tipoArea} onChange={e => setTipoArea(e.target.value)}
            style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 10px",color:"white",fontSize:"12px",outline:"none"}}>
            <option>Privativa</option>
            <option>Total</option>
            <option>Terreno</option>
          </select>
        </div>
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
          <div style={{flex:1}}>
            <label style={{fontSize:"10px",color:"#6b6b80",display:"block",marginBottom:"3px"}}>Área mínima</label>
            <input type="number" placeholder="0" value={areaMin || ""}
              onChange={e => { setAreaMin(Number(e.target.value)); setPage(1); }}
              style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 8px",color:"white",fontSize:"12px",outline:"none"}} />
          </div>
          <div style={{flex:1}}>
            <label style={{fontSize:"10px",color:"#6b6b80",display:"block",marginBottom:"3px"}}>Área máxima</label>
            <input type="number" placeholder="500" value={areaMax === 500 ? "" : areaMax}
              onChange={e => { setAreaMax(Number(e.target.value) || 500); setPage(1); }}
              style={{width:"100%",background:"#18181f",border:"1px solid #2a2a35",borderRadius:"8px",padding:"6px 8px",color:"white",fontSize:"12px",outline:"none"}} />
          </div>
        </div>
        <input type="range" min={0} max={500} value={areaMin}
          onChange={e => { setAreaMin(Number(e.target.value)); setPage(1); }}
          style={{width:"100%",accentColor:"#f97316",marginBottom:"4px"}} />
        <input type="range" min={0} max={500} value={areaMax}
          onChange={e => { setAreaMax(Number(e.target.value)); setPage(1); }}
          style={{width:"100%",accentColor:"#f97316"}} />
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#6b6b80",marginTop:"4px"}}>
          <span>{areaMin} m²</span>
          <span>{areaMax === 500 ? "500+ m²" : `${areaMax} m²`}</span>
        </div>
      </FiltroSection>

      <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
        <button onClick={buscarImoveis}
          style={{flex:1,background:"#f97316",color:"white",border:"none",borderRadius:"10px",padding:"12px",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>
          Aplicar Filtros
        </button>
        <button onClick={limparFiltros}
          style={{flex:1,background:"transparent",color:"#9ca3af",border:"1px solid #2a2a35",borderRadius:"10px",padding:"12px",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>
          Limpar Filtros
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <Navbar />
      <main style={{paddingTop:"64px",minHeight:"100vh",background:"#0a0a0f"}}>
        <div style={{maxWidth:"1400px",margin:"0 auto",padding:"32px 16px"}}>

          {/* Header */}
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"16px",marginBottom:"24px"}}>
            <div>
              <h1 style={{fontSize:"28px",fontWeight:"800",color:"white",margin:0}}>Encontre seu Imóvel</h1>
              <p style={{color:"#6b6b80",fontSize:"13px",marginTop:"4px"}}>
                {total.toLocaleString("pt-BR")} imóveis disponíveis · Página {page} de {totalPages || 1}
              </p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{display:"none",background:"#111118",border:"1px solid #2a2a35",color:"white",padding:"8px 16px",borderRadius:"8px",fontSize:"13px",cursor:"pointer"}}>
                Filtros
              </button>
              <select value={ordenar} onChange={e => { setOrdenar(e.target.value); setPage(1); }}
                style={{background:"#111118",border:"1px solid #2a2a35",color:"white",padding:"8px 12px",borderRadius:"8px",fontSize:"13px",outline:"none",cursor:"pointer"}}>
                <option value="desconto_desc">Maior desconto</option>
                <option value="preco_asc">Menor preço</option>
                <option value="preco_desc">Maior preço</option>
                <option value="data_asc">Data mais próxima</option>
                <option value="data_desc">Data mais distante</option>
                <option value="recente">Mais recentes</option>
              </select>
            </div>
          </div>

          <div style={{display:"flex",gap:"24px",alignItems:"flex-start"}}>
            <Sidebar />

            <div style={{flex:1,minWidth:0}}>
              {/* Busca rápida */}
              <div style={{marginBottom:"16px"}}>
                <input value={busca} onChange={e => { setBusca(e.target.value); setPage(1); }}
                  placeholder="🔍 Buscar por cidade, bairro ou título..."
                  style={{width:"100%",background:"#111118",border:"1px solid #2a2a35",borderRadius:"10px",padding:"10px 16px",color:"white",fontSize:"14px",outline:"none",boxSizing:"border-box"}} />
              </div>

              {loading ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"20px"}}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} style={{background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",overflow:"hidden"}}>
                      <div style={{height:"180px",background:"#18181f"}} />
                      <div style={{padding:"16px"}}>
                        <div style={{height:"14px",background:"#18181f",borderRadius:"4px",marginBottom:"8px",width:"70%"}} />
                        <div style={{height:"12px",background:"#18181f",borderRadius:"4px",width:"50%"}} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : imoveis.length === 0 ? (
                <div style={{textAlign:"center",padding:"80px 20px",color:"#6b6b80"}}>
                  <div style={{fontSize:"48px",marginBottom:"16px"}}>🔍</div>
                  <p style={{fontSize:"16px"}}>Nenhum imóvel encontrado com esses filtros.</p>
                  <button onClick={limparFiltros} style={{marginTop:"16px",color:"#f97316",background:"none",border:"none",cursor:"pointer",fontSize:"14px",textDecoration:"underline"}}>
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"20px"}}>
                    {imoveis.map((item) => <CardImovel key={item.codigo_caixa} item={item} />)}
                  </div>

                  {totalPages > 1 && (
                    <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"8px",marginTop:"40px",flexWrap:"wrap"}}>
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        style={{padding:"8px 16px",background:"#111118",border:"1px solid #2a2a35",borderRadius:"8px",color:"white",fontSize:"13px",cursor:"pointer",opacity: page === 1 ? 0.4 : 1}}>
                        ← Anterior
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            style={{width:"40px",height:"40px",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:"pointer",
                              background: p === page ? "#f97316" : "#111118",
                              border: p === page ? "none" : "1px solid #2a2a35",
                              color:"white"}}>
                            {p}
                          </button>
                        );
                      })}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        style={{padding:"8px 16px",background:"#111118",border:"1px solid #2a2a35",borderRadius:"8px",color:"white",fontSize:"13px",cursor:"pointer",opacity: page === totalPages ? 0.4 : 1}}>
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
    <div style={{borderTop:"1px solid #2a2a35",paddingTop:"14px",marginTop:"14px"}}>
      <button onClick={() => setOpen(!open)}
        style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",color:"white",cursor:"pointer",padding:0,marginBottom: open ? "10px" : 0}}>
        <span style={{fontSize:"13px",fontWeight:"600"}}>{title}</span>
        <span style={{color:"#6b6b80",fontSize:"11px"}}>{open ? "▲" : "▼"}</span>
      </button>
      {open && children}
    </div>
  );
}

function CardImovel({ item }) {
  const desconto = item.desconto || (item.valor_avaliacao && item.valor_leilao
    ? Math.round((1 - item.valor_leilao / item.valor_avaliacao) * 100) : 0);

  const foto = Array.isArray(item.fotos) ? item.fotos[0] : item.fotos;
  const fotoFinal = foto && typeof foto === "string" && foto.startsWith("http")
    ? foto : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600";

  const MODALIDADE_CORES = {
    "Compra Direta": "#16a34a",
    "Licitação aberta": "#d97706",
    "Leilão SFI": "#dc2626",
    "Venda Online": "#2563eb",
    "Venda Direta Online": "#7c3aed",
  };
  const corModal = MODALIDADE_CORES[item.modalidade] || "#6b7280";

  return (
    <Link href={`/imoveis/${item.codigo_caixa}`} style={{textDecoration:"none",display:"block",background:"#111118",border:"1px solid #2a2a35",borderRadius:"12px",overflow:"hidden",transition:"transform 0.2s,border-color 0.2s"}}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor="#f97316aa"; }}
      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.borderColor="#2a2a35"; }}>
      <div style={{position:"relative",height:"180px",background:"#18181f",overflow:"hidden"}}>
        <img src={fotoFinal} alt={item.titulo} style={{width:"100%",height:"100%",objectFit:"cover"}}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"; }} />
        {desconto > 0 && (
          <span style={{position:"absolute",top:"10px",left:"10px",background:"linear-gradient(135deg,#f97316,#dc2626)",color:"white",fontSize:"11px",fontWeight:"700",padding:"3px 8px",borderRadius:"20px"}}>
            {desconto}% OFF
          </span>
        )}
        {item.modalidade && (
          <span style={{position:"absolute",top:"10px",right:"10px",background:corModal,color:"white",fontSize:"10px",fontWeight:"600",padding:"3px 8px",borderRadius:"20px",textTransform:"uppercase"}}>
            {item.modalidade}
          </span>
        )}
        {item.tipo_imovel && (
          <span style={{position:"absolute",bottom:"10px",right:"10px",background:"rgba(0,0,0,0.7)",color:"#e5e7eb",fontSize:"10px",padding:"3px 8px",borderRadius:"20px",backdropFilter:"blur(4px)"}}>
            {item.tipo_imovel}
          </span>
        )}
      </div>
      <div style={{padding:"14px"}}>
        <h3 style={{fontWeight:"700",color:"white",fontSize:"13px",margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.titulo}</h3>
        <p style={{color:"#6b6b80",fontSize:"11px",margin:"0 0 10px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          📍 {[item.bairro, item.cidade, item.estado].filter(Boolean).join(", ")}
        </p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{color:"#f97316",fontWeight:"800",fontSize:"17px"}}>{fmt(item.valor_leilao)}</div>
            {item.valor_avaliacao > 0 && (
              <div style={{color:"#4b5563",fontSize:"11px",textDecoration:"line-through"}}>{fmt(item.valor_avaliacao)}</div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"4px",alignItems:"flex-end"}}>
            {item.aceita_fgts && <span style={{background:"rgba(22,163,74,0.2)",color:"#4ade80",fontSize:"10px",padding:"2px 8px",borderRadius:"4px",border:"1px solid rgba(22,163,74,0.3)"}}>FGTS</span>}
            {item.aceita_financiamento && <span style={{background:"rgba(37,99,235,0.2)",color:"#60a5fa",fontSize:"10px",padding:"2px 8px",borderRadius:"4px",border:"1px solid rgba(37,99,235,0.3)"}}>Financ.</span>}
          </div>
        </div>
        {item.data_leilao && (
          <div style={{marginTop:"10px",paddingTop:"10px",borderTop:"1px solid #2a2a35",fontSize:"11px",color:"#6b6b80"}}>
            📅 {new Date(item.data_leilao).toLocaleString("pt-BR", {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
          </div>
        )}
      </div>
    </Link>
  );
}
