export function extractHttpError(err: any, fallback: string): string {
  if (!err) return fallback;
  const detail = err?.error?.detail;
  if (typeof detail === 'string' && detail) return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join('; ');
  const msg = err?.message;
  if (typeof msg === 'string' && msg && msg !== 'Http failure response') return msg;
  const errBody = err?.error;
  if (errBody && typeof errBody === 'object' && !(errBody instanceof ProgressEvent) && !(errBody instanceof Event)) {
    const s = JSON.stringify(errBody);
    if (s !== '{}') return s;
  }
  if (typeof errBody === 'string' && errBody) return errBody;
  return fallback;
}
