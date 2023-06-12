import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";
import { getCognitoTokenFromCookie } from "./src/auth/services/get-cognito-token-from-cookie";
import { refreshCognitoTokenThenSetCookie } from "./src/auth/services/refresh-cognito-token-then-set-cookie";
import { verifyCognitoToken } from "./src/auth/services/verify-cognito-token";
import { CognitoToken } from "./src/auth/types/cognito-token";

// 認証を必要としないパスを定義する
const unauthenticatedPaths: string[] = ["/signin"];

// 認証を必要とするパスを定義する
const authenticatedPaths: string[] = ["/dashboard"];

// 認証されていないユーザーが保護されたリソースにアクセスすることを防止するミドルウェア。
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const url: NextURL = request.nextUrl.clone();

  const signin = `${url.origin}/signin`;
  const dashboard = `${url.origin}/dashboard`;

  // ルートURLアクセスの場合ダッシュボード画面へ
  if (url.pathname === "/") {
    return NextResponse.redirect(dashboard);
  }

  const cognitoToken: CognitoToken | null = getCognitoTokenFromCookie(request);
  if (!cognitoToken) {
    // Cookieからtokenが取得出来ないかつ、認証必須画面アクセスの場合ログイン画面へ
    if (authenticatedPaths.includes(url.pathname)) {
      return NextResponse.redirect(signin);
    }

    return NextResponse.next();
  }

  try {
    // idTokenを検証する
    await verifyCognitoToken(cognitoToken.idToken);

    // idToken検証結果が有効(認証済)かつ認証不要画面アクセスの場合ダッシュボード画面へ
    if (unauthenticatedPaths.includes(url.pathname)) {
      return NextResponse.redirect(dashboard);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("ID Token is not valid", error);
    try {
      let response: NextResponse = NextResponse.next();

      // refreshTokenを使ってtoken再生成、idToken/accessTokenをCookieにセット
      response = await refreshCognitoTokenThenSetCookie(
        cognitoToken.refreshToken,
        request,
        response
      );

      return response;
    } catch (error) {
      console.error("failed to the refresh token", error);
    }
  }

  // idToken検証がエラーだった場合ログイン画面へ
  return NextResponse.redirect(signin);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     * - .svg (SVG file)
     * - excluded paths (e.g. static screen path)
     */
    "/((?!api|_next/static|favicon.ico|.*\\.svg).*)",
  ],
};
