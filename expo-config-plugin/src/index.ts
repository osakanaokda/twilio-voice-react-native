import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';
import withTwilioVoiceIOS from './withTwilioVoiceIOS';
import withTwilioVoiceAndroid from './withTwilioVoiceAndroid';

const pkg = require('../package.json');

const withTwilioVoice: ConfigPlugin = (config) => {
  config = withTwilioVoiceIOS(config);
  config = withTwilioVoiceAndroid(config);
  return config;
};

export default createRunOncePlugin(withTwilioVoice, pkg.name, pkg.version);
