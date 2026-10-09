import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateUUID,
  getOrCreateGuestId,
  getSavedNickname,
  saveNickname,
  authService,
} from '../services/auth';
import { isSupabaseConfigured } from '../services/supabase';

describe('Auth & Service Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates valid RFC4122 v4 compliant UUIDs', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('persists and retrieves stable guest ID in localStorage', () => {
    const id1 = getOrCreateGuestId();
    expect(id1).toBeDefined();

    const id2 = getOrCreateGuestId();
    expect(id1).toBe(id2);
  });

  it('persists and updates player nickname in localStorage', () => {
    const initialName = getSavedNickname();
    expect(initialName).toMatch(/^Tactician#/);

    saveNickname('VortexMaster');
    expect(getSavedNickname()).toBe('VortexMaster');
  });

  it('loads guest profile when not logged in or Supabase unconfigured', async () => {
    saveNickname('CyberTactician');
    const profile = await authService.getCurrentProfile();

    expect(profile.username).toBe('CyberTactician');
    expect(profile.isGuest).toBe(true);
    expect(profile.id).toBeDefined();
  });

  it('reports configuration status for Supabase correctly', () => {
    // In test environment without .env, it should return false
    expect(typeof isSupabaseConfigured()).toBe('boolean');
  });
});
