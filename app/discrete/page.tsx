'use client';

import { useRouter } from 'next/navigation';
import DiscreteCalc from '@/components/primitive/DiscreteCalc';

export default function DiscretePage() {
  const router = useRouter();
  return (
    <main className="dp">
      <div className="dp__bar">
        <span>Calculadora</span>
      </div>
      <DiscreteCalc onExit={() => router.push('/')} />
      <style jsx>{`
        .dp { min-height: 100vh; background: #050509; color: white; padding: 24px 16px; display: flex; flex-direction: column; gap: 24px; }
        .dp__bar { text-align: center; font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; }
      `}</style>
    </main>
  );
}
