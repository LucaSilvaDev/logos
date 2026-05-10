import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Selah — Pausa e Meditação Bíblica",
  description: "Bíblia, devocionais e plano de leitura para o cristão reformado.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Selah",
    statusBarStyle: "black-translucent",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('selah-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}`
        }} />
        <meta name="theme-color" content="#12111e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="h-full bg-glass-base dark:bg-glass-base antialiased">
        {children}
      </body>
    </html>
  )
}
