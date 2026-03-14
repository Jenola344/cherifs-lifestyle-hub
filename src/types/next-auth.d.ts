import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      favorites?: string[];
      isVerified?: boolean;
      createdAt?: string | Date;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    favorites?: string[];
    isVerified?: boolean;
    createdAt?: string | Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    favorites?: string[];
    isVerified?: boolean;
    createdAt?: string | Date;
  }
}
