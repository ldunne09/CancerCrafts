import { requireSession } from '@/lib/session';
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return children;
}
