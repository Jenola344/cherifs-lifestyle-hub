/**
 * Global Application Configuration
 * This file centralizes all public/non-sensitive business constants.
 * Credentials and secrets must ONLY live in environment variables.
 */

export const APP_CONFIG = {
    // Branding
    siteName: "Cherif's Lifestyle Hub",

    // Support & Concierge
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349031103553",
    whatsappLink: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349031103553"}`,
    contactEmail: "cheriflifestyle1@gmail.com",

    // Social Media
    socials: {
        instagram: "https://www.instagram.com/cheriflifestylegallery?igsh=NXBmNnZlcWRia3hh",
        whatsapp: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349031103553"}`,
        snapchat: "https://www.snapchat.com/add/thee_cherif?share_id=5xGP2EFt2kg&locale=en-US",
        tiktok: "https://www.tiktok.com/@the_cherif3?_r=1&_t=ZS-946fRKy9Rh6",
        telegram: "https://t.me/cheriftv1"
    },

    // Booking
    calendlyLink: process.env.NEXT_PUBLIC_CALENDLY_LINK || "https://calendly.com/cheriflifestyle1/30min",

    // User Experience
    defaultCurrency: "₦",
    defaultLocale: "en-NG"
};

// Next.js Environment Variable Helpers — for non-sensitive public config only
export const getEnv = (key: string, fallback: string) => {
    return process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || fallback;
};
