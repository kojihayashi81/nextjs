# README

Nextjs(middleware) + AWS Amplify(Cognito) の認証ミドルウェアの実装テスト

Cognitoユーザプールで認証後のcookieに保存されたアクセストークン、IDトークン、リフレッシュトークンを利用して保護されたパス以外にアクセスできないように制御する。

IDトークンが切れている場合はリフレッシュトークを利用してmiddlewareからIDトークンの再更新をリクエストする。

