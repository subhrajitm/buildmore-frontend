export function parseNameFromEmail(email: string): string {
  return email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function decodeTokenRole(token: string): 'USER' | 'ADMIN' {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch {
    return 'USER';
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload?.exp) return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return false;
  }
}
