import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, requireAdmin } from '@/lib/auth-helpers';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
    default: vi.fn(),
}));

describe('Auth Helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('requireAuth', () => {
        it('should return 401 if no session exists', async () => {
            (getServerSession as any).mockResolvedValue(null);
            const result = await requireAuth();
            expect(result.session).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.status).toBe(401);
        });

        it('should return session if authenticated', async () => {
            const mockSession = { user: { email: 'test@example.com' } };
            (getServerSession as any).mockResolvedValue(mockSession);
            const result = await requireAuth();
            expect(result.session).toEqual(mockSession);
            expect(result.error).toBeNull();
        });
    });

    describe('requireAdmin', () => {
        it('should return 403 if user is not an admin', async () => {
            (getServerSession as any).mockResolvedValue({
                user: { email: 'user@example.com', role: 'user' }
            });
            const result = await requireAdmin();
            expect(result.error).toBeDefined();
            expect(result.error?.status).toBe(403);
        });

        it('should allow if user is admin', async () => {
            const mockSession = { user: { email: 'admin@example.com', role: 'admin' } };
            (getServerSession as any).mockResolvedValue(mockSession);
            const result = await requireAdmin();
            expect(result.error).toBeNull();
        });
    });
});
