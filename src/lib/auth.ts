import type { Environment } from '../types';

export interface AstronautProfile {
  id: string;
  name: string;
  callsign: string;
  role: string;
  environment: Environment;
  avatar: string;
  pin?: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'astra.auth.users.v1';
const ACTIVE_USER_STORAGE_KEY = 'astra.auth.current_user.v1';

// No sample or demo profiles pre-created
export const DEFAULT_ASTRONAUTS: AstronautProfile[] = [];

const safeStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

// Filter out any legacy sample profiles if they were stored in a previous session
const isLegacyDemoId = (id: string) => ['elena-rostova', 'abbas-tariq', 'marcus-chen'].includes(id);

export function getRegisteredAstronauts(): AstronautProfile[] {
  const store = safeStorage();
  if (!store) return [];
  try {
    const raw = store.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(u => u && typeof u === 'object' && !isLegacyDemoId(u.id));
      if (filtered.length !== parsed.length) {
        store.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveRegisteredAstronauts(users: AstronautProfile[]): void {
  const store = safeStorage();
  if (!store) return;
  store.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getActiveAstronautId(): string | null {
  const store = safeStorage();
  if (!store) return null;
  const id = store.getItem(ACTIVE_USER_STORAGE_KEY);
  if (id && isLegacyDemoId(id)) {
    store.removeItem(ACTIVE_USER_STORAGE_KEY);
    return null;
  }
  return id;
}

export function getActiveAstronaut(): AstronautProfile | null {
  const activeId = getActiveAstronautId();
  if (!activeId) return null;
  const users = getRegisteredAstronauts();
  return users.find(u => u.id === activeId) ?? null;
}

export function setActiveAstronaut(id: string | null): void {
  const store = safeStorage();
  if (!store) return;
  if (id === null) {
    store.removeItem(ACTIVE_USER_STORAGE_KEY);
  } else {
    store.setItem(ACTIVE_USER_STORAGE_KEY, id);
  }
}

export function registerAstronaut(data: {
  name: string;
  callsign: string;
  role: string;
  environment?: Environment;
  avatar?: string;
  pin?: string;
}): AstronautProfile {
  const users = getRegisteredAstronauts();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'astronaut';
  const id = `${slug}-${Date.now().toString(36)}`;
  const newUser: AstronautProfile = {
    id,
    name: data.name.trim(),
    callsign: data.callsign.trim() || 'Crew-Lead',
    role: data.role.trim() || 'Flight Specialist',
    environment: data.environment || 'iss',
    avatar: data.avatar || 'orbit',
    pin: data.pin?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  const updated = [...users, newUser];
  saveRegisteredAstronauts(updated);
  return newUser;
}

export function loginAstronaut(id: string, pin?: string): { success: boolean; error?: string; user?: AstronautProfile } {
  const users = getRegisteredAstronauts();
  const user = users.find(u => u.id === id);
  if (!user) {
    return { success: false, error: 'Astronaut profile not found.' };
  }
  if (user.pin && user.pin !== (pin ?? '').trim()) {
    return { success: false, error: 'Incorrect PIN. Try again.' };
  }
  setActiveAstronaut(user.id);
  return { success: true, user };
}

export function logoutAstronaut(): void {
  setActiveAstronaut(null);
}
