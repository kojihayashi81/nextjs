import { NextRequest, NextResponse } from "next/server";
import { TokenType } from "../constants/token-type";
import { getCookieByCognitoTokenType } from "./get-cookie-by-cognito-token-type";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const setTokenIntoCookie = (
  request: NextRequest,
  response: NextResponse,
  tokenType: TokenType,
  tokenValue: string
): NextResponse => {
  const cookie: RequestCookie | null = getCookieByCognitoTokenType(
    request,
    tokenType
  );

  if (!cookie) {
    throw Error(`${tokenType} is not found in the request cooke`);
  }

  response.cookies.set({
    name: cookie.name,
    value: tokenValue,
    secure: true,
    httpOnly: true,
  });

  return response;
};
