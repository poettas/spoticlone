import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify";

async function refreshAccessToken(token) {
    try {
        spotifyApi.setAccessToken(token.accesToken);
        spotifyApi.setRefreshToken(token.refreshToken);

        const { body: refreshedToken } = await spotifyApi.refreshAccessToken();
        console.log(`Refreshtoken is ${refreshedToken}`);

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now + refreshedToken.expires_in * 1000, // => 60 min as 3600 returns from the spotify API
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken, // replace if new one come back, else fall back to old refreshtoken
        };
    } catch (error) {
        console.log(error);
        return {
            ...token,
            error: "RefreshAccesstokenError",
        };
    }
}

export default NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            authorization: LOGIN_URL,
        }),
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, account, user }) {
            // for the first, initial sign-in
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    username: account.providerAccountId,
                    // handle expiry time in milliseconds
                    accessTokenExpires: account.expires_at * 1000,
                };
            }

            //if the first token hasn't expired yet..

            if (Date.now() < token.accessTokenExpires) {
                console.log("First token is valid!");
                return token;
            }

            //access token is expired
            console.log("First token has expired, now the refresh token");
            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            session.user.accessToken = token.accessToken;
            session.user.refreshToken = token.refreshToken;
            session.user.username = token.username;

            return session;
        },
    },
});
