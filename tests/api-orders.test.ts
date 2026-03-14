import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/orders/route';
import { requireAuth } from '@/lib/auth-helpers';
import Art from '@/models/Art';
import Order from '@/models/Order';
import { createMocks } from 'node-mocks-http';

// Mock dependencies
vi.mock('@/lib/mongoose', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/auth-helpers', () => ({
    requireAuth: vi.fn(),
    requireAdmin: vi.fn(),
}));

vi.mock('@/models/Art', () => ({
    default: {
        find: vi.fn(),
    },
}));

vi.mock('@/models/Order', () => ({
    default: {
        create: vi.fn(),
    },
}));

describe('Orders API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should recalculate price server-side and ignore client-submitted price', async () => {
        // 1. Mock session
        (requireAuth as any).mockResolvedValue({
            session: { user: { id: 'user_123', email: 'test@example.com' } }
        });

        // 2. Mock Art database records
        (Art.find as any).mockReturnValue({
            lean: () => Promise.resolve([
                { _id: 'art_1', price: 1000 },
                { _id: 'art_2', price: 2000 }
            ])
        });

        // 3. Mock Order creation
        (Order.create as any).mockResolvedValue({
            toObject: () => ({ _id: 'new_order_id' }),
            _id: 'new_order_id'
        });

        // 4. Create request with "tampered" price
        const body = {
            items: [
                { artId: 'art_1', quantity: 1 },
                { artId: 'art_2', quantity: 2 }
            ],
            shippingAddress: {
                name: 'John Doe',
                address: '123 Main St',
                city: 'Lagos',
                phone: '08012345678'
            },
            totalPrice: 100 // Tampered price
        };

        const request = new Request('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        // 5. Call POST handler
        const response = await POST(request);
        const data = await response.json();

        // 6. Verify result
        expect(response.status).toBe(200);
        
        // Expected price: (1000 * 1) + (2000 * 2) = 5000
        expect(Order.create).toHaveBeenCalledWith(expect.objectContaining({
            totalPrice: 5000
        }));
    });

    it('should return 400 if an item is missing in database', async () => {
        (requireAuth as any).mockResolvedValue({
            session: { user: { id: 'user_123' } }
        });

        (Art.find as any).mockReturnValue({
            lean: () => Promise.resolve([{ _id: 'art_1', price: 1000 }])
        });

        const body = {
            items: [{ artId: 'missing_art', quantity: 1 }],
            shippingAddress: { name: 'J', address: 'A', city: 'C', phone: 'P' }
        };

        const request = new Request('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain('Art item not found');
    });
});
