const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require('@expo/config-plugins');
const { resolve } = require('path');
const fs = require('fs');

const withTwilioVoiceAndroid = (config) => {
  // Add necessary permissions to AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

    // Add required permissions if they don't exist
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

    // Add the TwilioVoiceExpoPackage to the app's packages
    mainApplication.$['android:name'] = '.MainApplication';

    return config;
  });

  // Copy google-services.json to the appropriate location during prebuild
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

      // Check if google-services.json exists in project root and copy it to android/app directory
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

module.exports = withTwilioVoiceAndroid;
