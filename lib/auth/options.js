import "server-only";
import GoogleProvider from "next-auth/providers/google";
import { syncGoogleUser } from "@/lib/auth/sync-user";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/user/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return false;
      }

      const appUser = await syncGoogleUser({
        email: user?.email,
        name: user?.name,
        image: user?.image,
        googleId: account.providerAccountId,
      });

      user.id = appUser.id;
      user.role = appUser.role;
      user.coins = appUser.coins;
      user.isPremium = appUser.isPremium;
      user.planTier = appUser.planTier;
      user.referralCode = appUser.referralCode;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? "student";
        token.coins = typeof user.coins === "number" ? user.coins : 0;
        token.isPremium = Boolean(user.isPremium);
        token.planTier = user.planTier ?? (user.isPremium ? "premium" : "free");
        token.referralCode = user.referralCode ?? null;
      } else if (!token.planTier) {
        token.planTier = token.isPremium ? "premium" : "free";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.coins = token.coins;
        session.user.isPremium = token.isPremium;
        session.user.planTier = token.planTier;
        session.user.referralCode = token.referralCode;
      }

      return session;
    },
  },
};
