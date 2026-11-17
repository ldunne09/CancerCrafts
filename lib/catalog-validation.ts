export const listingCategories = { 'care-kits': 'Care kits', wellbeing: 'Wellbeing', 'support-services': 'Support services' } as const;
export const assistanceCategories = { transportation: 'Transportation', meals: 'Meals', household: 'Household', financial: 'Financial' } as const;
export type CatalogKind = 'listing' | 'request';
export type CatalogState = { error?: string; message?: string };
export function cents(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{1,7}(\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return result > 0 && result <= 100000000 ? result : null;
}
export const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
export function parseCatalog(form: FormData, kind: CatalogKind) {
  const title = form.get('title'); const description = form.get('description'); const category = form.get('category');
  const amount = cents(form.get('amount'));
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120 || typeof description !== 'string' || !description.trim() || description.length > 5000 || typeof category !== 'string' || !Object.hasOwn(kind === 'listing' ? listingCategories : assistanceCategories, category) || amount === null) return null;
  return { title: title.trim(), description: description.replace(/\r\n?/g, '\n').trim(), category, amount };
}
