import NextAuth from "next-auth";
import { authOptions } from "./option";

const handler = NextAuth(authOptions); //methods that takes authOptions as an argument and returns a handler function

export { handler as GET, handler as POST };
