import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isNil } from "./utils/ts-utils";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isNil(token)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/players/:path*"] };
