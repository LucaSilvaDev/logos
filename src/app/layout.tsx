import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Selah — Pausa e Meditação Bíblica",
  description: "Seu caderno devocional digital.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('selah-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}`
        }} />
      </head>
      <body className="h-full bg-glass-base dark:bg-glass-base antialiased">
        {children}
      </body>
    </html>
  )
}
