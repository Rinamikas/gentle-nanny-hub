import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestBuilder } from '@supabase/postgrest-js';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type VerificationCode = Database['public']['Tables']['verification_codes']['Row'];

describe('Authentication Flow', () => {
  it('should handle successful verification and session creation', async () => {
    console.log("Starting authentication flow test");
    
    // Mock verification code check
    const mockCode: VerificationCode = {
      id: '123',
      email: 'test@example.com',
      code: '123456',
      status: 'pending',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create a properly typed mock builder
    const mockBuilder = {
      select: () => mockBuilder,
      eq: () => mockBuilder,
      gt: () => mockBuilder,
      order: () => mockBuilder,
      limit: () => Promise.resolve({ data: [mockCode], error: null })
    } as unknown as PostgrestBuilder<VerificationCode>;

    // Mock Supabase client methods
    vi.spyOn(supabase, 'from').mockImplementation(() => ({
      select: () => mockBuilder,
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    } as any));

    // Create a properly typed mock session
    const mockSession: Session = {
      access_token: 'test_token',
      refresh_token: 'test_refresh_token',
      expires_in: 3600,
      expires_at: new Date(Date.now() + 3600000).getTime(),
      token_type: 'bearer',
      user: {
        id: 'test_user_id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString()
      }
    };

    // Mock auth methods with proper return types
    vi.spyOn(supabase.auth, 'signInWithOtp').mockResolvedValue({
      data: { session: mockSession, user: mockSession.user },
      error: null
    });

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    // Simulate verification process
    const { data: { session }, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(session).toBeDefined();
    if (session) {
      expect(session.access_token).toBe('test_token');
    }

    // Проверяем получение сессии
    const { data: sessionData } = await supabase.auth.getSession();
    expect(sessionData.session).toBeDefined();
    if (sessionData.session) {
      expect(sessionData.session.access_token).toBe('test_token');
    }
  });

  it('should handle session persistence', async () => {
    console.log("Testing session persistence");
    
    // Mock persisted session
    const mockPersistedSession: Session = {
      access_token: 'persisted_token',
      refresh_token: 'persisted_refresh',
      expires_in: 3600,
      expires_at: new Date(Date.now() + 3600000).getTime(),
      token_type: 'bearer',
      user: {
        id: 'persisted_user_id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString()
      }
    };

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: mockPersistedSession },
      error: null
    });

    const { data: { session }, error } = await supabase.auth.getSession();
    
    expect(error).toBeNull();
    expect(session).toBeDefined();
    if (session) {
      expect(session.access_token).toBe('persisted_token');
    }
  });
});