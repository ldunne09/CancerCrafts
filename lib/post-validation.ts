export const categories = {
  nutrition: 'Nutrition', transportation: 'Transportation', wellbeing: 'Wellbeing', support: 'Support',
} as const;

export type PostInput = { category: keyof typeof categories; content: string; anonymous: boolean };
export type PostState = { error?: string };
export const validPostId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function parsePost(form: FormData): PostInput | null {
  const category = form.get('category');
  const content = form.get('content');
  if (typeof category !== 'string' || !Object.hasOwn(categories, category) || typeof content !== 'string') return null;
  const trimmed = content.replace(/\r\n?/g, '\n').trim();
  if (!trimmed || trimmed.length > 5000) return null;
  return { category: category as keyof typeof categories, content: trimmed, anonymous: form.get('anonymous') === 'on' };
}
