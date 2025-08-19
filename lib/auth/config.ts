import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for auth operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // You'll need to set up Prisma
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Query user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (error || !user) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            avatar_url: user.avatar_url,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.avatar_url = user.avatar_url;
      }

      // Handle OAuth account linking
      if (account && user) {
        try {
          // Update user with OAuth info
          await supabase
            .from('users')
            .update({
              [`${account.provider}_id`]: account.providerAccountId,
              avatar_url: user.image || token.avatar_url,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error updating user OAuth info:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatar_url = token.avatar_url as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email!)
            .single();

          if (!existingUser) {
            // Create new user
            const { error } = await supabase
              .from('users')
              .insert({
                email: user.email!,
                name: user.name!,
                username: user.email!.split('@')[0] + Math.random().toString(36).substr(2, 5),
                avatar_url: user.image,
                [`${account.provider}_id`]: account.providerAccountId,
                email_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (error) {
              console.error('Error creating user:', error);
              return false;
            }
          }
        } catch (error) {
          console.error('SignIn error:', error);
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`);
      
      if (isNewUser) {
        // Send welcome email or perform other onboarding actions
        console.log(`New user registered: ${user.email}`);
      }
    },
    async signOut({ token }) {
      console.log(`User ${token.email} signed out`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
