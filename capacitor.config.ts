// Run: npm install @capacitor/core @capacitor/cli before using this file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CapacitorConfig = any

/**
 * Capacitor config para publicação nas lojas (Apple App Store + Google Play).
 *
 * Para usar:
 *   1. npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
 *   2. npx cap init
 *   3. npx cap add ios
 *   4. npx cap add android
 *   5. npm run build  →  npx cap copy  →  npx cap open ios / android
 *
 * Modo recomendado: apontar para a URL de produção hospedada (server.url).
 * Isso evita ter que exportar o Next.js como static e mantém SSR/API routes.
 */

const config: CapacitorConfig = {
  appId: "com.selah.app",
  appName: "Selah",
  // Aponte para a URL de produção após o deploy
  // Remova server.url para usar bundle local (requer next export)
  server: {
    url: "https://selah.app", // ← substituir pela URL real após deploy
    cleartext: false,
    allowNavigation: ["selah.app"],
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#121214",
    preferredContentMode: "mobile",
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
  },
  android: {
    backgroundColor: "#121214",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#121214",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#121214",
      overlaysWebView: true,
    },
  },
}

export default config
