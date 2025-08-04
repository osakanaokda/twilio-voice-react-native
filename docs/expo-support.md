# Expo Support

このドキュメントでは、Twilio の音声 SDK を Expo アプリケーションで使用する方法について説明します。

## 要件

- Expo SDK 48 以降
- expo-modules-core 1.2.0 以降
- React Native 0.72 以降

## セットアップ手順

### 1. インストール

```bash
npm install @twilio/voice-react-native-sdk
# または
yarn add @twilio/voice-react-native-sdk
```

### 2. expo-dev-client を使用する

Twilio の Voice SDK はネイティブコードを含んでいるため、通常の Expo Go 環境では動作しません。代わりに、Expo Dev Client を使用する必要があります。

```bash
npx expo install expo-dev-client
```

### 3. google-services.json ファイルの追加

Android デバイスで着信コールを受信するためには、Firebase Cloud Messaging を設定する必要があります。プロジェクトのルートディレクトリに`google-services.json`ファイルを配置してください。

### 4. app.json または app.config の設定

`app.json`または`app.config.js`ファイルに以下の設定を追加してください:

```json
{
  "expo": {
    // ... 他の設定
    "plugins": ["@twilio/voice-react-native-sdk"]
  }
}
```

### 5. 開発ビルドの作成

Expo Dev Client のビルドを作成します:

```bash
eas build --profile development --platform all
```

または個別のプラットフォーム向けに:

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 6. アプリケーションでの使用例

```javascript
import { ExpoModule } from '@twilio/voice-react-native-sdk';
import { useEffect } from 'react';

// アプリケーションのコード内で
useEffect(() => {
  // アクセストークンはサーバーから取得する必要があります
  const accessToken = 'YOUR_ACCESS_TOKEN';

  // 着信通話を受けるための登録
  const registerForCalls = async () => {
    try {
      await ExpoModule.register(accessToken);
      console.log('Successfully registered for calls');
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  registerForCalls();

  return () => {
    // クリーンアップ時に登録を解除
    ExpoModule.unregister().catch(console.error);
  };
}, []);

// 発信通話を行う関数
const makeOutgoingCall = async (accessToken) => {
  try {
    await ExpoModule.connect(accessToken);
    console.log('Call connected');
  } catch (error) {
    console.error('Failed to connect call:', error);
  }
};
```

## 注意事項

- Expo Dev Client でのみ動作します。通常の Expo Go 環境では動作しません。
- iOS では PushKit と Background Modes が、Android では複数の権限が自動的に設定されます。
- Firebase の設定は手動で行う必要があります。
