import { App } from '@/utils/env';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authSecret = App.getOrThrow('NEXTAUTH_SECRET');
const username = App.get('AUTH_USERNAME', 'admin');
const password = App.get('AUTH_PASSWORD', 'admin123');

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'Enter username',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter password',
        },
      },
      async authorize(credentials) {
        if (
          credentials?.username &&
          credentials?.password &&
          credentials.username === username &&
          credentials.password === password
        ) {
          return {
            id: credentials.username,
            name: credentials.username,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: authSecret,
});

export { handler as GET, handler as POST };
