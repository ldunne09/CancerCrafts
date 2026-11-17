export type ProfileValues = { name: string; location: string; bio: string };
export type ProfileState = { error?: string };

export function validDisplayName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 80;
}

export function parseProfile(form: FormData): ProfileValues | null {
  const name = form.get('name');
  const location = form.get('location');
  const bio = form.get('bio');
  if (!validDisplayName(name) || typeof location !== 'string' || typeof bio !== 'string') return null;
  const values = { name: name.trim(), location: location.trim(), bio: bio.replace(/\r\n?/g, '\n').trim() };
  if (values.location.length > 160 || values.bio.length > 1000) return null;
  return values;
}
