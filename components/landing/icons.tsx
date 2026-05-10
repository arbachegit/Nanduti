/**
 * Mini-app icons — geometric SVG, sem emoji.
 * Compartilhados entre Sidebar e Landing.
 */
import type { ReactElement, SVGProps } from 'react';

const baseProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconWallet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="17" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGov(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 9l9-5 9 5" />
      <path d="M5 9v9M19 9v9M9 9v9M15 9v9" />
      <path d="M3 19h18" />
    </svg>
  );
}

export function IconHealth(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

export function IconEdu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 6v12l8-3 8 3V6l-8 3-8-3z" />
      <path d="M12 9v9" />
    </svg>
  );
}

export function IconCrypto(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 11h18" />
      <rect x="6" y="14" width="4" height="3" rx="0.5" />
      <path d="M14 16h4" />
    </svg>
  );
}

export function IconInfo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h6" />
    </svg>
  );
}

export function IconAlerts(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3l9.5 17H2.5L12 3z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="17.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPolice(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconDocs(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 7c0-1 1-2 2-2h5l2 2h7c1 0 2 1 2 2v9c0 1-1 2-2 2H5c-1 0-2-1-2-2V7z" />
      <path d="M3 11h18" />
    </svg>
  );
}

export const APP_ICON: Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  wallet: IconWallet,
  gov:    IconGov,
  health: IconHealth,
  edu:    IconEdu,
  crypto: IconCrypto,
  info:   IconInfo,
  alerts: IconAlerts,
  police: IconPolice,
  docs:   IconDocs,
};
