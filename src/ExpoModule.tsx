import { NativeModules, Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

/**
 * ExpoModule wrapper to interact with native Expo modules
 * This class provides methods that wrap the native functionality
 * exposed by the Expo modules on Android and iOS
 */
export class ExpoModule {
  private androidExpoNativeModule: any = null;

  constructor() {
    if (Platform.OS === 'android') {
      try {
        this.androidExpoNativeModule = requireNativeModule('TwilioVoiceExpo');
      } catch (e) {
        console.warn('Failed to load TwilioVoiceExpo Expo module:', e);
      }
    }
  }

  /**
   * Connect to make an outgoing call
   * @param accessToken - Voice access token
   * @param callee - Name of the callee
   * @param twiMLParams - Parameters to pass to the TwiML
   * @param displayName - Display name for the call notification
   * @returns Promise that resolves when the connection is established
   */
  async connect(
    accessToken: string,
    callee?: string,
    twiMLParams?: Record<string, string>,
    displayName?: string
  ): Promise<any> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_connect(
        accessToken,
        callee,
        twiMLParams,
        displayName
      );
    } else if (Platform.OS === 'ios') {
      return NativeModules.TwilioVoiceReactNative.connect(
        accessToken,
        twiMLParams || {}
      );
    }
    return Promise.reject(
      new Error('Platform not supported or module not loaded')
    );
  }

  /**
   * Register for push notifications
   * @param accessToken - Voice access token
   * @returns Promise that resolves when registration is complete
   */
  async register(accessToken: string): Promise<any> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_register(accessToken);
    } else if (Platform.OS === 'ios') {
      return NativeModules.TwilioVoiceReactNative.register(accessToken);
    }
    return Promise.reject(
      new Error('Platform not supported or module not loaded')
    );
  }

  /**
   * Unregister from push notifications
   * @returns Promise that resolves when unregistration is complete
   */
  async unregister(): Promise<any> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_unregister();
    } else if (Platform.OS === 'ios') {
      return NativeModules.TwilioVoiceReactNative.unregister();
    }
    return Promise.reject(
      new Error('Platform not supported or module not loaded')
    );
  }
}
