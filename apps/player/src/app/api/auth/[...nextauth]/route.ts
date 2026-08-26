import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Simple demo auth - replace with real validation
        if (
          credentials?.username &&
          credentials?.password &&
          credentials.username === process.env.AUTH_USERNAME &&
          credentials.password === process.env.AUTH_PASSWORD
        ) {
          return {
            id: credentials.username,
            name: credentials.username,
            email: `${credentials.username}@teleplay.local`,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
