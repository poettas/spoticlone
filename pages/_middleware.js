import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    // token will exist if the user is logged in
    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    const { pathname } = req.nextUrl;

    // allow the req if the following is true...
    // 1. its a request for next-auth sessions & provider fetching
    // 2. the token exists
    if (pathname.includes("/api/auth") || token) {
        return NextResponse.next();
    }

    // redirect them to login if they don`t have token AND are requesting a protected route
    if (!token && pathname !== "/login") {
        // written out URL is needed, so you have to create a new one like that
        return NextResponse.redirect(new URL("/login", req.url));
    }
}
