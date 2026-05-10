import LandingDeck from '@/components/landing/LandingDeck';
import { getLandingShowcase } from '@/lib/data-source/landing';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const data = await getLandingShowcase();
  return <LandingDeck data={data} />;
}
