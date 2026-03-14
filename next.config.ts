import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // `domains` is deprecated in Next.js 13+. Use `remotePatterns` instead.
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
};

export default nextConfig;
