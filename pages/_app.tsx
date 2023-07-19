import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import type { AppProps } from "next/app";
import awsExports from "../src/aws-exports";
import "../styles/globals.css";

Amplify.configure({
  ...awsExports,
  ssr: true,
  Auth: {
    region: "ap-northeast-1",
    userPoolId: "ap-northeast-1_3GUWY9M6w",
    userPoolWebClientId: "25q8rcbq5kro6f3ocho133u6e0",
    cookieStorage: {
      domain: 'localhost',
      path: '/',
      expires: 1,
      sameSite: 'strict',
      secure: true
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator.Provider>
      <Component {...pageProps} />
    </Authenticator.Provider>
  );
}
