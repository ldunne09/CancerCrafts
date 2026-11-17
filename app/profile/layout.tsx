import { requireSession } from '@/lib/session';
export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return children;
}
