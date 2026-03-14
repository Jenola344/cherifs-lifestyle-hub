'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
    id: string;
    title: string;
    image: string;
    price: number;
    category: string;
}

export interface CartItem extends Product {
    quantity: number;
    size?: string;
    frame?: 'Framed' | 'Frameless';
    cartId: string; // Unique ID for this specific line item (combo of product + options)
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Product & { size?: string, frame?: 'Framed' | 'Frameless' }) => void;
    removeFromCart: (cartId: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cherif_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cherif_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: Product & { size?: string, frame?: 'Framed' | 'Frameless' }) => {
        setCart(prev => {
            const cartId = `${item.id}-${item.size}-${item.frame}`;
            const existing = prev.find(p => p.cartId === cartId);

            if (existing) {
                return prev.map(p =>
                    p.cartId === cartId
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            }
            return [...prev, { ...item, quantity: 1, cartId }];
        });
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => {
        const itemTotal = item.price * item.quantity;
        const framingPremium = item.frame === 'Framed' ? 150 * item.quantity : 0;
        return acc + itemTotal + framingPremium;
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
