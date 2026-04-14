import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import EmailProvider from "next-auth/providers/email";

// Determine if we should use the database adapter.
const useAdapter = !!process.env.MONGODB_URI;

export const authOptions: NextAuthOptions = {
    ...(useAdapter ? { adapter: MongoDBAdapter(clientPromise) as any } : {}),
    providers: [

        EmailProvider({
            server: {
              host: process.env.EMAIL_SERVER_HOST,
              port: Number(process.env.EMAIL_SERVER_PORT),
              auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              },
            },
            from: process.env.EMAIL_FROM,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error("Invalid email or password");
                }

                if (!user.password) {
                    throw new Error("This email is registered via another method. Please use the appropriate sign-in method.");
                }

                if (!user.isVerified) {
                    throw new Error("Please verify your email address to sign in. Check your inbox for the verification link.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user?: any }) {
            if (user) {
                token.id = user.id;
                token.createdAt = user.createdAt;
                token.role = user.role || 'user';
            }
            // Always ensure admin emails have the admin role, applied on every request
            const adminEmails = (process.env.ADMIN_EMAIL || process.env.EMAIL_SERVER_USER || '').split(',').map(e => e.trim().toLowerCase());
            if (token.email && adminEmails.includes(token.email.toLowerCase())) {
                token.role = 'admin';
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.createdAt = token.createdAt;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth',
    },
    events: {
        async createUser({ user }: any) {
            await dbConnect();
            const User = (await import("@/models/User")).default;
            await User.findByIdAndUpdate(user.id, { createdAt: new Date() });
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
