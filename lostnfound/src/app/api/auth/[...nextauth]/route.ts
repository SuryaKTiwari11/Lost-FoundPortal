import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bycrpt from "bcrypt";
import dbConnect from "@/app/libs/mongodb";
import User from "@/app/models/user";
import { a, th } from "framer-motion/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      Credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              {
                email: credentials.identifier,
              },
              {
                rollNumber: credentials.identifier,
              },
              {
                username: credentials.identifier,
              },
            ],
          });

          if (!user) {
            throw new Error("No user found with the given credentials");
          }
          if (!user.verified) {
            throw new Error("User is not verified yet");
          }
          const isPasswordCorrect = await bycrpt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error: any) {
          throw new Error("Error connecting to database: " + error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
        if(user) {
            token._
        }
        return token;
  },
  async session({ session, token }) {
    return session;
  }

  pages
: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
