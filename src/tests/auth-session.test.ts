import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Auth Session Management', () => {
  it('should properly handle session after OTP verification', async () => {
    console.log("Testing OTP verification and session creation");
    
    const testEmail = 'test@example.com';
    const testCode = '123456';

    // Мокаем ответ от signInWithOtp
    const mockSession = {
      access_token: 'test_token',
      refresh_token: 'test_refresh',
      expires_in: 3600,
      user: {
        id: 'test_user_id',
        email: testEmail,
      }
    };

    vi.spyOn(supabase.auth, 'signInWithOtp').mockResolvedValue({
      data: { session: mockSession },
      error: null
    } as any);

    // Проверяем создание сессии
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        data: {
          verification_code: testCode
        }
      }
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.session?.access_token).toBe('test_token');

    // Проверяем получение сессии
    const { data: sessionData } = await supabase.auth.getSession();
    expect(sessionData.session).toBeDefined();
  });

  it('should handle session persistence', async () => {
    console.log("Testing session persistence");
    
    // Мокаем существующую сессию
    const mockPersistedSession = {
      access_token: 'persisted_token',
      refresh_token: 'persisted_refresh',
      expires_in: 3600,
      user: {
        id: 'persisted_user_id',
        email: 'test@example.com',
      }
    };

    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: mockPersistedSession },
      error: null
    } as any);

    const { data: { session }, error } = await supabase.auth.getSession();
    
    expect(error).toBeNull();
    expect(session).toBeDefined();
    expect(session?.access_token).toBe('persisted_token');
  });
});