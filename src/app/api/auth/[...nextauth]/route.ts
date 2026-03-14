import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import EmailProvider from "next-auth/providers/email";

// Determine if we should use the database adapter.
// During build time on Render/Vercel, we might not have the URI yet.
const useAdapter = !!process.env.MONGODB_URI;

export const authOptions: NextAuthOptions = {
    // Only attach the adapter if we have a connection string.
    // This prevents the MongoDB library from trying to initialize during build.
    ...(useAdapter ? { adapter: MongoDBAdapter(clientPromise) as any } : {}),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            // allowDangerousEmailAccountLinking removed — it is a known account-takeover vector.
            // If a Google account and a password account share the same email, the user
            // must sign in with the original method or use the "forgot password" flow.
        }),
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
                    throw new Error("This email is registered with Google. Please sign in with Google.");
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
                token.role = user.role || 'user';
                token.id = user.id;
                token.createdAt = user.createdAt;
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
            // MongoDBAdapter might not set timestamps via driver.
            // Let Mongoose ensure they're there if we re-fetch, but best set it now.
            await dbConnect();
            const User = (await import("@/models/User")).default;
            await User.findByIdAndUpdate(user.id, { createdAt: new Date() });
        }
    },
    // NEXTAUTH_SECRET must be set in the environment. No fallback — a missing secret
    // means NextAuth will refuse to sign any JWTs, which is the safe failure mode.
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
