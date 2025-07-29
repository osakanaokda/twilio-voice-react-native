import { Platform, NativeEventEmitter } from 'react-native';
import { NativeModule } from './common';
import { requireNativeModule } from 'expo-modules-core';

/**
 * ExpoModule - Expo環境でTwilio Voice SDKを使用するためのモジュール
 * このファイルはExpo Dev Clientでの使用のためのインターフェースを提供します
 */
class ExpoModuleImpl {
  private androidExpoNativeModule: any;
  private eventEmitter: NativeEventEmitter;

  constructor() {
    if (Platform.OS === 'android') {
      try {
        this.androidExpoNativeModule = requireNativeModule(
          'TwilioVoiceReactNative'
        );
      } catch (e) {
        console.error('Twilioモジュールのロードに失敗しました:', e);
        this.androidExpoNativeModule = null;
      }
    }

    // イベントエミッタの初期化
    this.eventEmitter = new NativeEventEmitter();
  }

  /**
   * Twilioモジュールを初期化
   * @param accessToken Twilioアクセストークン
   */
  async initialize(accessToken?: string) {
    console.debug('[ExpoVoiceModule] initialize');
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      try {
        if (this.androidExpoNativeModule.initialize) {
          return this.androidExpoNativeModule.initialize(accessToken);
        } else {
          console.warn(
            '[ExpoVoiceModule] initialize メソッドがネイティブモジュールに実装されていません'
          );
        }
      } catch (e) {
        console.error('[ExpoVoiceModule] 初期化に失敗しました:', e);
      }
    } else if (Platform.OS === 'ios') {
      // iOSはReact Nativeモジュールを使用
      return accessToken
        ? NativeModule.register(accessToken)
        : Promise.resolve();
    }
    return Promise.resolve();
  }

  /**
   * 発信処理
   * @param accessToken Twilioアクセストークン
   * @param params 通話パラメータ
   */
  async connect(accessToken: string, params: any = {}) {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_connect(accessToken, params);
    } else if (Platform.OS === 'ios') {
      // iOSはReact Nativeモジュールを使用
      return NativeModule.connect(accessToken, params);
    } else {
      console.error(
        'Twilio Voice SDKが初期化されていないか、このプラットフォームでは利用できません'
      );
      return null;
    }
  }

  /**
   * 着信応答
   * @param callInviteUuid 着信UUID
   */
  async acceptCallInvite(callInviteUuid: string) {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.accept_call_invite(callInviteUuid);
    } else if (Platform.OS === 'ios') {
      // iOSはReact Nativeモジュールを使用
      return NativeModule.acceptCallInvite(callInviteUuid);
    } else {
      console.error(
        'Twilio Voice SDKが初期化されていないか、このプラットフォームでは利用できません'
      );
      return false;
    }
  }

  /**
   * 着信拒否
   * @param callInviteUuid 着信UUID
   */
  async rejectCallInvite(callInviteUuid: string) {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.reject_call_invite(callInviteUuid);
    } else if (Platform.OS === 'ios') {
      // iOSはReact Nativeモジュールを使用
      return NativeModule.rejectCallInvite(callInviteUuid);
    } else {
      console.error(
        'Twilio Voice SDKが初期化されていないか、このプラットフォームでは利用できません'
      );
      return false;
    }
  }

  /**
   * 通話終了
   * @param callUuid 通話UUID
   */
  async disconnectCall(callUuid: string) {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.disconnect_call(callUuid);
    } else if (Platform.OS === 'ios') {
      // iOSはReact Nativeモジュールを使用
      return NativeModule.disconnectCall(callUuid);
    } else {
      console.error(
        'Twilio Voice SDKが初期化されていないか、このプラットフォームでは利用できません'
      );
      return false;
    }
  }

  /**
   * ミュート切り替え
   * @param callUuid 通話UUID
   * @param isMuted ミュート状態
   */
  async muteCall(callUuid: string, isMuted: boolean) {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.mute_call(callUuid, isMuted);
    } else if (Platform.OS === 'ios') {
      // iOSはReact Nativeモジュールを使用
      return NativeModule.muteCall(callUuid, isMuted);
    } else {
      console.error(
        'Twilio Voice SDKが初期化されていないか、このプラットフォームでは利用できません'
      );
      return false;
    }
  }

  /**
   * イベントリスナーを追加
   * @param eventName イベント名
   * @param listener リスナー関数
   */
  addListener(eventName: string, listener: (event: any) => void) {
    return this.eventEmitter.addListener(eventName, listener);
  }

  /**
   * 全てのイベントリスナーを削除
   * @param eventType 特定のイベントタイプを指定する場合
   */
  removeAllListeners(eventType?: string) {
    if (eventType) {
      this.eventEmitter.removeAllListeners(eventType);
    } else {
      // 全てのイベントリスナーを削除
      // 注: NativeEventEmitterの実装によっては全てのイベントを削除する方法が異なる場合があります
      const knownEvents = ['callInvite', 'call', 'messageReceived']; // 既知のイベントタイプ
      knownEvents.forEach((eventName) => {
        this.eventEmitter.removeAllListeners(eventName);
      });
    }
  }
}

// シングルトンインスタンスをエクスポート
export const ExpoVoiceModule = new ExpoModuleImpl();
