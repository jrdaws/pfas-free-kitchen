import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth.js configuration
 * Add or remove providers as needed
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Email/Password (uncomment to enable)
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials) {
    //     // Add your own logic here to validate credentials
    //     // Return user object or null
    //     return null;
    //   },
    // }),
  ],
  
  pages: {
    signIn: "/login",
    // signOut: "/logout",
    // error: "/auth/error",
    // newUser: "/welcome",
  },
  
  callbacks: {
    async session({ session, token }) {
      // Add custom properties to session
      if (session.user) {
        session.user.id = token.sub!;
        // session.user.role = token.role as string;
      }
      return session;
    },
    
    async jwt({ token, user }) {
      // Add custom properties to JWT
      if (user) {
        token.id = user.id;
        // token.role = user.role;
      }
      return token;
    },
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Uncomment to use database adapter
  // adapter: PrismaAdapter(prisma),
};

