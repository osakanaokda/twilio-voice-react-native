import { ConfigPlugin, withInfoPlist } from '@expo/config-plugins';

const withTwilioVoiceIOS: ConfigPlugin = (config) => {
  return withInfoPlist(config, (modConfig) => {
    // 1. Add Microphone Usage Description
    if (!modConfig.modResults.NSMicrophoneUsageDescription) {
      modConfig.modResults.NSMicrophoneUsageDescription =
        'This app requires microphone access to make and receive calls.';
    }

    // 2. Add Background Modes for VoIP and Audio
    if (!modConfig.modResults.UIBackgroundModes) {
      modConfig.modResults.UIBackgroundModes = [];
    }
    const requiredBackgroundModes = ['audio', 'voip'];
    for (const mode of requiredBackgroundModes) {
      if (!modConfig.modResults.UIBackgroundModes.includes(mode)) {
        modConfig.modResults.UIBackgroundModes.push(mode);
      }
    }

    return modConfig;
  });
};

export default withTwilioVoiceIOS;
