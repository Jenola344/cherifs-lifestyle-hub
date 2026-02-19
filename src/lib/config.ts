/**
 * Global Application Configuration
 * This file centralizes all business constants and provides reliable fallbacks
 * for the live environment (Vercel) where .env variables might be missed.
 */

export const APP_CONFIG = {
    // Branding
    siteName: "Cherif's Lifestyle Hub",

    // Support & Concierge
    whatsappNumber: "2349031103553",
    whatsappLink: "https://wa.me/2349031103553",
    contactEmail: "hello@cherifslifestylehub.com",

    // Booking
    calendlyLink: "https://calendly.com/cheriflifestyle1/30min",

    // Admin Security
    // Use this to log into the dashboard if the database is reset
    adminFallback: {
        email: "admin@cherif.com",
        password: "admin123",
        userName: "Hub Director"
    },

    // User Experience
    defaultCurrency: "₦",
    defaultLocale: "en-NG"
};

// Next.js Environment Variable Helpers
export const getEnv = (key: string, fallback: string) => {
    return process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || fallback;
};
