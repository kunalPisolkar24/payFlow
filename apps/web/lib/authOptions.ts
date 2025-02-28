import prisma from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/auth/authorize?response_type=code&prompt=login"
      }
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Enter your email" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" }
      },
      async authorize(credentials) {
        const emailSchema = z.string().email();
        const passwordSchema = z.string().min(8);
        try {
          const validEmail = emailSchema.parse(credentials?.email);
          const validPassword = passwordSchema.parse(credentials?.password);
          const user = await prisma.user.findUnique({
            where: { email: validEmail }
          });
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(validPassword, user.password);
          return passwordsMatch
            ? {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: user.emailVerified
              }
            : null;
        } catch (error) {
          console.error("Validation or authorization error:", error);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.image as string | null
        };
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      await prisma.wallet.create({
        // @ts-ignore
        data: { userId: user.id }
      });
    }
  }
};
