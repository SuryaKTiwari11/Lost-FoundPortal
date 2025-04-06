import NextAuth from "next-auth";
import { authOptions } from "./option";

const handler = NextAuth(authOptions);

// Export the GET and POST handlers
export { handler as GET, handler as POST };
