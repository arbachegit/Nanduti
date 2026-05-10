import type { ReactNode } from 'react';
import Script from 'next/script';
import { NandutiLocaleProvider } from '@/components/LocaleProvider';
import './globals.css';

export const metadata = {
  title: 'Ñandutí — Paraguay Digital',
  description: 'Super-app conversacional con IA para el ciudadano paraguayo. Trámites, salud, educación y más en castellano, guaraní y jopará.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08080F',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PY">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&display=swap"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>
        <NandutiLocaleProvider initial="jopara">
          <div className="nanduti-root">{children}</div>
          <Script id="nanduti-sw-register" strategy="afterInteractive">
            {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/nanduti-sw.js').catch(() => null); }`}
          </Script>
        </NandutiLocaleProvider>
      </body>
    </html>
  );
}
