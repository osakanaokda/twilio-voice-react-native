import {
  ConfigPlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withProjectBuildGradle,
  withMainActivity,
  withMainApplication,
  AndroidConfig,
} from '@expo/config-plugins';

const { addPermission } = AndroidConfig.Permissions;

const withTwilioVoiceAndroid: ConfigPlugin = (config) => {
  config = withPermissions(config);
  config = withGoogleServicesGradle(config);
  config = withTwilioVoiceMainActivity(config);
  config = withTwilioVoiceMainApplication(config);
  // Note: Services and Receivers are handled by the library's AndroidManifest.xml automatically
  // when using React Native autolinking/CNG.
  return config;
};

const withPermissions: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (modConfig) => {
    const permissions = [
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.BLUETOOTH',
      // 'android.permission.BLUETOOTH_CONNECT', // Android 12+
    ];

    permissions.forEach((permission) => {
      addPermission(modConfig.modResults, permission);
    });

    return modConfig;
  });
};

const withGoogleServicesGradle: ConfigPlugin = (config) => {
  config = withProjectBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language === 'groovy') {
      const googleServicesClasspath =
        'classpath "com.google.gms:google-services:4.4.1"';
      if (
        !modConfig.modResults.contents.includes(
          'com.google.gms:google-services'
        )
      ) {
        modConfig.modResults.contents = modConfig.modResults.contents.replace(
          /dependencies\s?{/,
          `dependencies {\n        ${googleServicesClasspath}`
        );
      }
    }
    return modConfig;
  });

  config = withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language === 'groovy') {
      const applyPlugin = 'apply plugin: "com.google.gms.google-services"';
      if (
        !modConfig.modResults.contents.includes(
          'com.google.gms.google-services'
        )
      ) {
        modConfig.modResults.contents += `\n${applyPlugin}\n`;
      }
    }
    return modConfig;
  });

  return config;
};

const withTwilioVoiceMainActivity: ConfigPlugin = (config) => {
  return withMainActivity(config, (modConfig) => {
    if (modConfig.modResults.language === 'java') {
      let contents = modConfig.modResults.contents;

      // Add Imports
      const imports = [
        'import com.twiliovoicereactnative.VoiceActivityProxy;',
        'import android.os.Bundle;',
        'import android.content.Intent;', // Ensure Intent is imported
      ];
      imports.forEach((imp) => {
        if (!contents.includes(imp)) {
          // Insert after package declaration or last import
          const match = contents.match(/package\s+[\w.]+;|import\s+[\w.]+;/g);
          if (match && match.length > 0) {
            const lastMatch = match[match.length - 1];
            contents = contents.replace(lastMatch, `${lastMatch}\n${imp}`);
          } else {
            contents = `${imp}\n${contents}`;
          }
        }
      });

      // Add VoiceActivityProxy field
      if (!contents.includes('private VoiceActivityProxy activityProxy')) {
        contents = contents.replace(
          'public class MainActivity extends ReactActivity {',
          'public class MainActivity extends ReactActivity {\n  private VoiceActivityProxy activityProxy;'
        );
      }

      // Add Hooks
      // We need to inject into onCreate, onDestroy, onStart, onStop, onNewIntent
      // For simplicity/robustness, we'll try to find common ReactActivity methods.
      // Note: ReactActivity in default Expo Template might not implement all these, so we might need to Override them.

      // onCreate
      if (
        contents.includes('protected void onCreate(Bundle savedInstanceState)')
      ) {
        if (!contents.includes('activityProxy.onCreate(savedInstanceState)')) {
          contents = contents.replace(
            /super\.onCreate\(savedInstanceState\);/,
            `super.onCreate(savedInstanceState);\n    activityProxy = new VoiceActivityProxy(this, permission -> {});\n    activityProxy.onCreate(savedInstanceState);`
          );
        }
      } else {
        // If onCreate doesn't exist (unlikely in template), we should add it?
        // Default Expo template usually has onCreate for SplashScreen.
      }

      // onDestroy
      if (!contents.includes('public void onDestroy()')) {
        contents = contents.replace(
          /}\s*$/, // End of class
          `\n  @Override\n  public void onDestroy() {\n    if (activityProxy != null) activityProxy.onDestroy();\n    super.onDestroy();\n  }\n}`
        );
      }

      // onStart, onStop, onNewIntent can be added similarly. Use simplified injection for now.

      modConfig.modResults.contents = contents;
    }
    return modConfig;
  });
};

const withTwilioVoiceMainApplication: ConfigPlugin = (config) => {
  return withMainApplication(config, (modConfig) => {
    if (modConfig.modResults.language === 'java') {
      let contents = modConfig.modResults.contents;

      // Add Import
      if (
        !contents.includes(
          'import com.twiliovoicereactnative.VoiceApplicationProxy;'
        )
      ) {
        contents = contents.replace(
          /package\s+[\w.]+;/,
          `$& \nimport com.twiliovoicereactnative.VoiceApplicationProxy;`
        );
      }

      // Add Field
      if (
        !contents.includes(
          'private VoiceApplicationProxy voiceApplicationProxy;'
        )
      ) {
        contents = contents.replace(
          'public class MainApplication extends Application implements ReactApplication {',
          'public class MainApplication extends Application implements ReactApplication {\n  private VoiceApplicationProxy voiceApplicationProxy;'
        );
      }

      // Hook onCreate
      if (contents.includes('public void onCreate()')) {
        if (
          !contents.includes(
            'voiceApplicationProxy = new VoiceApplicationProxy(this)'
          )
        ) {
          contents = contents.replace(
            /super\.onCreate\(\);/,
            `super.onCreate();\n    voiceApplicationProxy = new VoiceApplicationProxy(this);\n    voiceApplicationProxy.onCreate();`
          );
        }
      }

      // Hook onTerminate
      if (!contents.includes('public void onTerminate()')) {
        contents = contents.replace(
          /}\s*$/,
          `\n  @Override\n  public void onTerminate() {\n    if (voiceApplicationProxy != null) voiceApplicationProxy.onTerminate();\n    super.onTerminate();\n  }\n}`
        );
      }

      modConfig.modResults.contents = contents;
    }
    return modConfig;
  });
};

export default withTwilioVoiceAndroid;
