import { App } from '@/components/app';

export default async function Page({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const { result } = await searchParams;
  return <App resultId={typeof result === 'string' ? result : undefined} />;
}
