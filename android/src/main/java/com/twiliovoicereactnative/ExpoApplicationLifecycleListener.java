package com.twiliovoicereactnative;

import android.app.Application;
import android.util.Log;

import expo.modules.core.interfaces.ApplicationLifecycleListener;

/**
 * ExpoApplicationLifecycleListener - Expoアプリケーションのライフサイクルイベントを処理
 * TwilioのVoiceApplicationProxyと連携して、Twilioの機能がExpo環境で正しく動作するようにします
 */
public class ExpoApplicationLifecycleListener implements ApplicationLifecycleListener {
    private static final String TAG = "ExpoAppLifeListener";
    private VoiceApplicationProxy voiceApplicationProxy;

    @Override
    public void onCreate(Application application) {
        Log.d(TAG, "onCreate");
        // VoiceApplicationProxyを初期化して、Twilioの機能を準備
        this.voiceApplicationProxy = new VoiceApplicationProxy(application);
        this.voiceApplicationProxy.onCreate();
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        Log.d(TAG, "onConfigurationChanged");
        // 設定変更時の処理が必要な場合はここに実装
    }

    @Override
    public void onLowMemory() {
        Log.d(TAG, "onLowMemory");
        // メモリ不足時の処理が必要な場合はここに実装
    }
}
