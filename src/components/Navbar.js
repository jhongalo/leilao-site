"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a35]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm" style={{fontFamily:'Syne,sans-serif'}}>L</span>
          </div>
          <span className="font-bold text-lg" style={{fontFamily:'Syne,sans-serif'}}>
            Leilão<span className="text-orange-500">Fácil</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Início</Link>
          <Link href="/imoveis" className="hover:text-white transition-colors">Imóveis</Link>
          <Link href="/como-funciona" className="hover:text-white transition-colors">Como Funciona</Link>
        </div>

        <Link
          href="/imoveis"
          className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Ver Imóveis
        </Link>

        <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#111118] border-t border-[#2a2a35] px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Início</Link>
          <Link href="/imoveis" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Imóveis</Link>
          <Link href="/como-funciona" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Como Funciona</Link>
          <Link href="/imoveis" className="bg-orange-500 text-white text-center py-2 rounded-lg font-semibold" onClick={() => setOpen(false)}>Ver Imóveis</Link>
        </div>
      )}
    </nav>
  );
}
