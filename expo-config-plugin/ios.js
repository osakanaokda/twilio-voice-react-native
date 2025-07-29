const {
  withInfoPlist,
  withEntitlementsPlist,
} = require('@expo/config-plugins');

// iOSでTwilio Voiceが正しく動作するために必要な権限と機能を追加するプラグイン
module.exports = (config) => {
  // Info.plistに必要な権限を追加
  config = withInfoPlist(config, (modConfig) => {
    if (!modConfig.modResults.UIBackgroundModes) {
      modConfig.modResults.UIBackgroundModes = [];
    }

    // バックグラウンドモードを追加（音声・VOIP）
    if (!modConfig.modResults.UIBackgroundModes.includes('audio')) {
      modConfig.modResults.UIBackgroundModes.push('audio');
    }
    if (!modConfig.modResults.UIBackgroundModes.includes('voip')) {
      modConfig.modResults.UIBackgroundModes.push('voip');
    }

    // マイク使用権限の説明
    modConfig.modResults.NSMicrophoneUsageDescription =
      modConfig.modResults.NSMicrophoneUsageDescription ||
      'マイクへのアクセスが必要です。通話機能を使用するために許可してください。';

    return modConfig;
  });

  // Entitlementsファイルにプッシュ通知の権限を追加
  config = withEntitlementsPlist(config, (modConfig) => {
    // プッシュ通知の設定
    modConfig.modResults['aps-environment'] = 'development';

    return modConfig;
  });

  return config;
};
