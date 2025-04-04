import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bycrpt from "bcrypt";
import dbConnect from "@/app/libs/mongodb";
import User from "@/model/user.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
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
          const user = await User.findOne({
            $or: [
              {
                universityEmail: credentials.identifier,
              },
              {
                rollNumber: credentials.identifier,
              },
            ],
          }).select("+password");

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
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.verified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.name = `${token.firstName} ${token.lastName}`;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
