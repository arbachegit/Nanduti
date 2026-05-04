'use client';

import { use } from 'react';
import Link from 'next/link';
import { useNandutiLocale } from '@/components/LocaleProvider';
import WalletApp from '@/components/miniapp/WalletApp';
import GovApp from '@/components/miniapp/GovApp';
import HealthApp from '@/components/miniapp/HealthApp';
import EduApp from '@/components/miniapp/EduApp';
import CryptoCardApp from '@/components/miniapp/CryptoCardApp';
import InfoApp from '@/components/miniapp/InfoApp';
import AlertsApp from '@/components/miniapp/AlertsApp';
import PoliceApp from '@/components/miniapp/PoliceApp';
import DocsApp from '@/components/miniapp/DocsApp';
import { useRouter } from 'next/navigation';

const TITLES: Record<string, string> = {
  wallet: 'wallet.title', gov: 'gov.title', health: 'health.title', edu: 'edu.title',
  crypto: 'crypto.title', info: 'info.title', alerts: 'alerts.title', police: 'police.title', docs: 'docs.title',
};

export default function ModalPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = use(params);
  const { t } = useNandutiLocale();
  const router = useRouter();

  return (
    <main className="mod">
      <header className="mod__h">
        <Link href="/" className="mod__back">← Ñandutí</Link>
        <h1>{t(TITLES[appId] ?? 'app.name')}</h1>
      </header>
      <div className="mod__body">
        {appId === 'wallet' ? <WalletApp /> : null}
        {appId === 'gov' ? <GovApp /> : null}
        {appId === 'health' ? <HealthApp /> : null}
        {appId === 'edu' ? <EduApp /> : null}
        {appId === 'crypto' ? <CryptoCardApp /> : null}
        {appId === 'info' ? <InfoApp /> : null}
        {appId === 'alerts' ? <AlertsApp /> : null}
        {appId === 'police' ? <PoliceApp onDiscrete={() => router.push('/discrete')} /> : null}
        {appId === 'docs' ? <DocsApp /> : null}
      </div>
      <style jsx>{`
        .mod { min-height: 100vh; background: radial-gradient(ellipse at top, #0d0d18 0%, #08080f 60%); color: var(--nd-t1); padding: 24px; max-width: 720px; margin: 0 auto; }
        .mod__h { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .mod__back { font-size: 13px; color: var(--nd-cyan); text-decoration: none; }
        .mod__h h1 { margin: 0; font-size: 28px; font-weight: 800; color: var(--nd-t1); }
        .mod__body { display: flex; flex-direction: column; gap: 16px; }
      `}</style>
    </main>
  );
}
