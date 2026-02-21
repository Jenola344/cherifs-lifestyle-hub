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
    contactEmail: "cheriflifestyle1@gmail.com",

    // Social Media
    socials: {
        instagram: "https://www.instagram.com/cheriflifestylegallery?igsh=NXBmNnZlcWRia3hh",
        whatsapp: "https://wa.me/2349031103553",
        snapchat: "https://www.snapchat.com/add/thee_cherif?share_id=5xGP2EFt2kg&locale=en-US",
        tiktok: "https://www.tiktok.com/@the_cherif3?_r=1&_t=ZS-946fRKy9Rh6",
        telegram: "https://t.me/cheriftv1"
    },

    // Booking
    calendlyLink: "https://calendly.com/cheriflifestyle1/30min",

    // Admin Security
    // Use this to log into the dashboard if the database is reset
    adminFallback: {
        email: "cheriflifestyle1@gmail.com",
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
