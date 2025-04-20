import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    image?: string | null;
    role: string;
    phone?: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
      email: string;
      name: string;
      image?: string | null;
      role: string;
      phone?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    role: string;
  }
}
