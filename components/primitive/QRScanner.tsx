'use client';

import { useEffect, useState } from 'react';

export default function QRScanner({ onResult }: { onResult: (qrSeed: string) => void }) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setScanning(false);
          onResult(`qr-${Date.now()}`);
          return 100;
        }
        return p + 5;
      });
    }, 80);
    return () => clearInterval(t);
  }, [scanning, onResult]);

  return (
    <div className="qrs">
      <div className="qrs__viewport">
        <div className="qrs__corner qrs__corner--tl" />
        <div className="qrs__corner qrs__corner--tr" />
        <div className="qrs__corner qrs__corner--bl" />
        <div className="qrs__corner qrs__corner--br" />
        <div className="qrs__line" style={{ top: `${progress}%` }} />
        <div className="qrs__hint">Apuntá al código QR del comercio</div>
      </div>
      <style jsx>{`
        .qrs { display: flex; align-items: center; justify-content: center; padding: 24px; }
        .qrs__viewport {
          position: relative; width: 240px; height: 240px;
          background: radial-gradient(ellipse at center, rgba(0,229,255,0.05), transparent 70%);
          border-radius: 12px; overflow: hidden;
        }
        .qrs__corner { position: absolute; width: 28px; height: 28px; border: 2px solid var(--nd-cyan); }
        .qrs__corner--tl { top: 6px; left: 6px; border-right: 0; border-bottom: 0; border-radius: 8px 0 0 0; }
        .qrs__corner--tr { top: 6px; right: 6px; border-left: 0; border-bottom: 0; border-radius: 0 8px 0 0; }
        .qrs__corner--bl { bottom: 6px; left: 6px; border-right: 0; border-top: 0; border-radius: 0 0 0 8px; }
        .qrs__corner--br { bottom: 6px; right: 6px; border-left: 0; border-top: 0; border-radius: 0 0 8px 0; }
        .qrs__line { position: absolute; left: 6%; right: 6%; height: 2px; background: var(--nd-cyan); box-shadow: 0 0 12px var(--nd-cyan); }
        .qrs__hint { position: absolute; bottom: -28px; left: 0; right: 0; text-align: center; font-size: 12px; color: var(--nd-t2); }
      `}</style>
    </div>
  );
}
