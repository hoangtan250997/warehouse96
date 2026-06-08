import { environment } from '../../environments/environment';

/**
 * Runtime backend switching.
 *
 * The API base URL is normally baked in at build time (see `environment.*.ts`
 * and the `php` build configuration). This module lets a deployed bundle point
 * at either backend at runtime by storing the choice in `localStorage` — no
 * rebuild or redeploy. The two backends do NOT share auth state (different
 * SECRET_KEY and different databases), so switching must clear the stored
 * token and force a re-login (handled by the header switcher).
 */

export type BackendKey = 'python' | 'php';

export const BACKENDS: Record<BackendKey, { label: string; baseUrl: string }> = {
  python: {
    label: 'Python',
    baseUrl: 'https://backend-python-do-an-h6bgeyarhfeagqff.malaysiawest-01.azurewebsites.net',
  },
  php: {
    label: 'PHP',
    baseUrl: 'https://warehouse-api-php.azurewebsites.net',
  },
};

const STORAGE_KEY = 'warehousefe.backend';

/** The explicit runtime override, or null when none is set. */
export function getSelectedBackend(): BackendKey | null {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'python' || v === 'php' ? v : null;
}

export function setSelectedBackend(key: BackendKey): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearSelectedBackend(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * The backend currently in effect: the runtime override if present, otherwise
 * inferred from the build-time `environment.apiBaseUrl` (empty/dev → Python,
 * which is what `proxy.conf.json` targets).
 */
export function activeBackend(): BackendKey {
  const selected = getSelectedBackend();
  if (selected) return selected;
  return environment.apiBaseUrl === BACKENDS.php.baseUrl ? 'php' : 'python';
}

/**
 * The base URL to prefix every API call with. When no runtime override is set
 * this returns the build-time default (so dev keeps using the proxy via the
 * empty string, and production keeps its baked-in URL).
 */
export function resolveApiBaseUrl(): string {
  const selected = getSelectedBackend();
  return selected ? BACKENDS[selected].baseUrl : environment.apiBaseUrl;
}
