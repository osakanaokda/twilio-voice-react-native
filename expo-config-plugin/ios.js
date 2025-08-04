const {
  withInfoPlist,
  withEntitlementsPlist,
} = require('@expo/config-plugins');

const withTwilioVoiceIos = (config) => {
  // Add background modes to Info.plist
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Add UIBackgroundModes array if it doesn't exist
    if (!infoPlist.UIBackgroundModes) {
      infoPlist.UIBackgroundModes = [];
    }

    // Add Audio and VoIP background modes if they don't exist
    const requiredBackgroundModes = ['audio', 'voip'];
    for (const mode of requiredBackgroundModes) {
      if (!infoPlist.UIBackgroundModes.includes(mode)) {
        infoPlist.UIBackgroundModes.push(mode);
      }
    }

    return config;
  });

  // Add Push Notifications entitlement
  config = withEntitlementsPlist(config, (config) => {
    const entitlementsPlist = config.modResults;

    // Add push notifications entitlement
    entitlementsPlist['aps-environment'] = 'development';

    return config;
  });

  return config;
};

module.exports = withTwilioVoiceIos;
