import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in User interface
   */
  interface User {
    id: string;
    role?: string;
    email: string;
    name?: string;
  }

  /**
   * Extend the built-in session interface
   */
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name?: string;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT interface
   */
  interface JWT {
    id: string;
    role?: string;
  }
}
