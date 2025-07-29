const {
  withGradleProperties,
  withAndroidManifest,
  withAppBuildGradle,
} = require('@expo/config-plugins');

// AndroidでTwilio Voiceが正しく動作するために必要な設定を追加するプラグイン
module.exports = (config) => {
  // gradle.propertiesファイルにFirebase Messaging関連の設定を追加
  config = withGradleProperties(config, (modConfig) => {
    modConfig.modResults = modConfig.modResults.filter(
      (item) =>
        item.type !== 'property' ||
        item.key !== 'twiliovoicereactnative_firebasemessagingservice_enabled'
    );

    modConfig.modResults.push({
      type: 'property',
      key: 'twiliovoicereactnative_firebasemessagingservice_enabled',
      value: 'true',
    });

    return modConfig;
  });

  // AndroidManifestにパーミッションを追加
  config = withAndroidManifest(config, (modConfig) => {
    // 必要なパーミッションを追加
    const permissions = [
      'android.permission.INTERNET',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.BLUETOOTH',
    ];

    // manifestにパーミッションが存在しない場合は追加
    permissions.forEach((permission) => {
      if (!modConfig.modResults.manifest['uses-permission']) {
        modConfig.modResults.manifest['uses-permission'] = [];
      }

      if (
        !modConfig.modResults.manifest['uses-permission'].find(
          (item) => item.$['android:name'] === permission
        )
      ) {
        modConfig.modResults.manifest['uses-permission'].push({
          $: {
            'android:name': permission,
          },
        });
      }
    });

    return modConfig;
  });

  // app/build.gradleにGoogle Servicesプラグインを適用
  config = withAppBuildGradle(config, (modConfig) => {
    if (
      !modConfig.modResults.includes(
        "apply plugin: 'com.google.gms.google-services'"
      )
    ) {
      // 末尾にGoogle Servicesプラグインを追加
      modConfig.modResults +=
        "\napply plugin: 'com.google.gms.google-services'\n";
    }

    return modConfig;
  });

  return config;
};
