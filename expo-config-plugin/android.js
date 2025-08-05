const {
  withAppBuildGradle,
  withProjectBuildGradle,
  withAndroidManifest,
  withGradleProperties,
  withDangerousMod,
  AndroidConfig,
} = require('@expo/config-plugins');
const { resolve } = require('path');
const fs = require('fs');

/**
 * Expo prebuild時にAndroidネイティブプロジェクトへTwilio Voice用のGoogle Servicesプラグイン・FCM設定を追加するConfig Plugin
 *
 * - FCM（Firebase Cloud Messaging）を使った着信通知・Push通知に必要な設定を自動で追加
 * - Twilio Voice SDKのAndroid要件を満たす
 * - Expo Managed/Bare両方で有効
 * - 追加される内容はandroid/build.gradle, android/app/build.gradle, AndroidManifest.xmlに反映される
 */
module.exports = function withTwilioVoiceAndroidConfig(config) {
  // 1. Gradle Properties編集（AndroidX/Jetifier有効化）
  config = withGradleProperties(config, (config) => {
    config.modResults = {
      ...config.modResults,
      'android.useAndroidX': true,
      'android.enableJetifier': true,
    };
    return config;
  });

  // 2. android/build.gradle編集（Google Services classpath追加）
  config = withProjectBuildGradle(config, (config) => {
    if (
      !config.modResults.contents.includes('com.google.gms:google-services')
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies {/,
        'dependencies {\n        classpath "com.google.gms:google-services:4.4.3"'
      );
    }
    return config;
  });

  // 3. android/app/build.gradle編集（google-services/kotlin-androidプラグイン追加）
  config = withAppBuildGradle(config, (config) => {
    if (
      !config.modResults.contents.includes(
        'apply plugin: "com.google.gms.google-services"'
      )
    ) {
      config.modResults.contents +=
        '\napply plugin: "com.google.gms.google-services"\n';
    }
    if (
      !config.modResults.contents.includes('apply plugin: "kotlin-android"')
    ) {
      config.modResults.contents += '\napply plugin: "kotlin-android"\n';
    }
    return config;
  });

  // 4. AndroidManifest.xml編集（FCMサービス有効化meta-data追加・パーミッション追加）
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

    // 必要なパーミッション
    const permissions = [
      'android.permission.INTERNET',
      'android.permission.RECORD_AUDIO',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.BLUETOOTH_CONNECT',
    ];
    for (const permission of permissions) {
      if (!AndroidConfig.Manifest.hasPermission(androidManifest, permission)) {
        AndroidConfig.Manifest.addPermission(androidManifest, permission);
      }
    }

    // FCMサービス有効化meta-data追加
    const configResources = mainApplication['meta-data'] || [];
    configResources.push({
      $: {
        'android:name':
          'twiliovoicereactnative_firebasemessagingservice_enabled',
        'android:value': 'true',
      },
    });
    mainApplication['meta-data'] = configResources;

    return config;
  });

  // 5. google-services.json自動コピー
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const googleServicesPath = resolve(
        config.modRequest.projectRoot,
        'google-services.json'
      );
      const appGoogleServicesPath = resolve(
        config.modRequest.platformProjectRoot,
        'app/google-services.json'
      );

      if (fs.existsSync(googleServicesPath)) {
        fs.copyFileSync(googleServicesPath, appGoogleServicesPath);
      } else {
        console.warn(
          'google-services.json not found in project root. Firebase Cloud Messaging may not work correctly.'
        );
      }

      return config;
    },
  ]);

  return config;
};
