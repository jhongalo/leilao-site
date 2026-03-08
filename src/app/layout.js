import "./globals.css";

export const metadata = {
  title: {
    default: "LeilãoFácil — Imóveis de Leilão com os Melhores Descontos",
    template: "%s | LeilãoFácil",
  },
  description: "Encontre imóveis de leilão da Caixa Econômica Federal em todo o Brasil. Descontos de até 90% no valor de avaliação. Aceita FGTS e Financiamento.",
  keywords: "leilão imóveis, caixa econômica leilão, imóveis com desconto, leilão SFI, licitação aberta, compra direta caixa, imóveis baratos brasil",
  authors: [{ name: "LeilãoFácil" }],
  creator: "LeilãoFácil",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://clever-raindrop-8346f0.netlify.app",
    siteName: "LeilãoFácil",
    title: "LeilãoFácil — Imóveis de Leilão com os Melhores Descontos",
    description: "Encontre imóveis de leilão da Caixa Econômica Federal em todo o Brasil. Descontos de até 90%.",
    images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200", width: 1200, height: 630, alt: "LeilãoFácil" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeilãoFácil — Imóveis de Leilão com os Melhores Descontos",
    description: "Imóveis de leilão da Caixa com até 90% de desconto.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
