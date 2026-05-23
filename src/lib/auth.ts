import NextAuth, { NextAuthOptions, Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import Auth0Provider from "next-auth/providers/auth0"
import { apiClient } from '@/lib/api'

type ApiResp = { success?: boolean; data?: Record<string, unknown>; error?: string }

function isApiResp(obj: unknown): obj is ApiResp {
  return typeof obj === 'object' && obj !== null
}

function succeeded(resp: unknown): boolean {
  return isApiResp(resp) && resp.success === true
}

function getData<T = unknown>(resp: unknown): T | undefined {
  if (isApiResp(resp) && 'data' in resp) return resp.data as T
  return undefined
}

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
      authorization: {
        params: {
          scope: "openid email profile",
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE!,
        },
      },
    }),
  ],
  
  callbacks: {
  async signIn({ user, account }) {
      // Allow sign in for all OAuth providers
      if (account?.provider && user.email) {
        try {
          // Call Rust backend to create or update user with social connection
          try {
            const resp = await apiClient.post('/api/auth/oauth/callback', {
              provider: account.provider,
              provider_user_id: account.providerAccountId,
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              scope: account.scope,
            })
            if (succeeded(resp)) {
              const userData = getData<Record<string, unknown>>(resp)
              if (userData && typeof userData['user_id'] === 'string') {
                (user as any).id = (userData['user_id'] as string) || user.id
              }
            } else {
              console.error('Failed to sync user with backend:', resp)
              return false
            }
          } catch (err) {
            console.error('Error syncing with backend:', err)
            return false
          }
        } catch (error) {
          console.error("Error syncing with backend:", error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          provider: account.provider,
          userId: user.id,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to refresh it
      // Note: Refresh logic can be implemented here if needed
      return token
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
        session.userId = token.userId as string
      }
      return session
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours (matching existing auth timeout)
  },

  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
