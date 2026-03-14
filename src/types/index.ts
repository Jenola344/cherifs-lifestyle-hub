/**
 * Shared TypeScript interfaces for the Cherif's Lifestyle Hub data layer.
 * Import from here instead of using `any` throughout the codebase.
 */

export interface OrderItem {
    artId: string;
    title: string;
    price: number;
    image: string;
    size?: string;
    frame?: string;
    quantity: number;
}

export interface ShippingAddress {
    name: string;
    address: string;
    city: string;
    phone: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface Order {
    id: string;
    userId: string;
    customerName: string;
    userEmail: string;
    platform?: string;
    items: OrderItem[];
    totalPrice: number;
    status: OrderStatus;
    shippingAddress: ShippingAddress;
    createdAt: string;
    updatedAt?: string;
}

export interface ArtItem {
    id: string;
    title: string;
    artist: string;
    price: number;
    category: string;
    description?: string;
    sizes: string[];
    image: string;
    status: 'available' | 'sold out';
    createdAt: string;
}

export interface BlogPost {
    id: string;
    title: string;
    category: string;
    date: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
}

export interface Review {
    id: string;
    artId: string;
    userName: string;
    userEmail: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Feedback {
    id: string;
    userName: string;
    email: string;
    rating: number;
    message: string;
    createdAt: string;
}

export interface AppNotification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    readBy: string[];
    createdAt: string;
}

export interface AppUser {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'user' | 'admin';
    favorites: string[];
    isVerified: boolean;
    createdAt: string;
}
