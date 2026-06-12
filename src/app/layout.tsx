import type { Metadata, Viewport } from "next"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121214",
}

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
          __html: `try{var t=localStorage.getItem('selah-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`
        }} />

        {/* PWA / Mobile */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Selah" />
        <meta name="format-detection" content="telephone=no" />

        {/* iOS Splash Screens — iPhone models */}
        {/* iPhone 16 Pro Max (430×932) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/splash-1290x2796.png" />
        {/* iPhone 16 Pro (393×852) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/splash-1179x2556.png" />
        {/* iPhone 15 / 14 / 13 / 12 (390×844) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/splash-1170x2532.png" />
        {/* iPhone SE 3rd gen (375×667) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/splash-750x1334.png" />
        {/* iPhone 8 Plus / 7 Plus (414×736) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/splash-1242x2208.png" />
        {/* iPhone 14 Plus / 13 Pro Max (428×926) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/splash-1284x2778.png" />
        {/* iPad Pro 12.9" (1024×1366) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/splash-2048x2732.png" />
        {/* iPad Pro 11" / iPad Air (820×1180) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/splash-1640x2360.png" />

        {/* Icons */}
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="h-full bg-glass-base dark:bg-glass-base antialiased">
        {children}
      </body>
    </html>
  )
}
