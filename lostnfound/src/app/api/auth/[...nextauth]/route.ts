import NextAuth from "next-auth";
import { authOptions } from "./option";

// Export handler functions for the API route
export const { GET, POST } = NextAuth(authOptions);
