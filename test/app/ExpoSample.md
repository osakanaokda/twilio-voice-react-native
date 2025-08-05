# Expo Dev Client サンプルアプリの使い方

このサンプルは、@twilio/voice-react-native-sdk の Expo Dev Client 対応を検証するためのものです。

## 前提

- EAS CLI, Expo CLI, Node.js, Yarn/NPM がインストール済み
- Firebase FCM の設定済み（google-services.json 配置済み）
- Twilio の Voice 用アクセストークン取得手段がある

## セットアップ

```sh
yarn install
cd test/app
yarn install
```

## Expo Dev Client のインストール

```sh
npx expo install expo-dev-client
```

<!-- これを行うとビルド時にimport/require関連のエラーが発生するので追加しない -->
<!-- ## プラグイン設定

Twilio Voice SDK は、Android/iOS のネイティブプロジェクトに対して多くの追加設定（権限・Gradle/Podfile・FCM/Push/VoIP 用の Capability や説明文など）が必要です。Expo プラグイン（`plugins`）を設定することで、これらのネイティブ設定が Expo prebuild 時に自動で追加され、手動で各種ファイルを編集する必要がなくなります。
Expo Managed/Dev Client 環境で「ネイティブ機能を使う」には必須の手順です。

`test/app/app.json` または `app.config.js` に以下を追加:

```json
{
  "expo": {
    "plugins": ["@twilio/voice-react-native-sdk"]
  }
}
``` -->

## カスタムクライアントのビルド

```sh
eas build --profile development --platform all
```

## サンプルアプリの起動

```sh
npx expo start --dev-client
```

## 主な動作確認ポイント

- 登録・発信・着信・Push 通知受信
- iOS/Android 両方で動作
- Expo Dev Client でネイティブ機能が利用できる

---

`test/app/src/`配下の`App.tsx`や`hook.ts`を参考に、Twilio Voice の API を Expo 環境で呼び出す実装例を確認できます。

---

何か問題があれば、ルートの`docs/expo-support.md`や README も参照してください。
