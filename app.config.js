// This file is required to properly utilize the Expo Config Plugins
// It will be automatically used by the Expo CLI during the prebuild phase

module.exports = {
  name: 'TwilioVoiceReactNative',
  slug: 'twilio-voice-react-native',
  plugins: [
    ['./expo-config-plugin/ios.js'],
    ['./expo-config-plugin/android.js'],
  ],
};
