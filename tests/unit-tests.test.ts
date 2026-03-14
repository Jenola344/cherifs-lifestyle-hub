import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
    beforeEach(() => {
        // We can't easily clear the internal 'store' Map without exporting it,
        // so we'll use unique keys for each test or mock Date.now()
        vi.useFakeTimers();
    });

    it('should allow requests within limit', () => {
        const key = 'user_1';
        expect(rateLimit(key, 2, 1000)).toBe(true);
        expect(rateLimit(key, 2, 1000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
        const key = 'user_2';
        rateLimit(key, 2, 1000);
        rateLimit(key, 2, 1000);
        expect(rateLimit(key, 2, 1000)).toBe(false);
    });

    it('should reset after window expires', () => {
        const key = 'user_3';
        const now = 1000000;
        vi.setSystemTime(now);
        
        rateLimit(key, 1, 1000);
        expect(rateLimit(key, 1, 1000)).toBe(false);
        
        // Advance time by 1001ms
        vi.setSystemTime(now + 1001);
        
        expect(rateLimit(key, 1, 1000)).toBe(true);
    });
});
