package com.twiliovoicereactnative;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import expo.modules.core.interfaces.ReactActivityLifecycleListener;

/**
 * ExpoActivityLifecycleListener - Expoアプリケーションのアクティビティライフサイクルイベントを処理
 * TwilioのVoiceActivityProxyと連携して、Twilioの機能がExpo環境で正しく動作するようにします
 */
public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
    private static final String TAG = "ExpoActivityLifeListener";
    private VoiceActivityProxy voiceActivityProxy;

    @Override
    public void onCreate(Activity activity, Bundle savedInstanceState) {
        Log.d(TAG, "onCreate");
        this.voiceActivityProxy = new VoiceActivityProxy(activity);
        this.voiceActivityProxy.onCreate(savedInstanceState);
    }

    @Override
    public boolean onNewIntent(Intent intent) {
        Log.d(TAG, "onNewIntent");
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onNewIntent(intent);
        }
        return false; // 他のリスナーも処理を続行できるようにfalseを返す
    }

    @Override
    public void onStart(Activity activity) {
        Log.d(TAG, "onStart");
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onStart();
        }
    }

    @Override
    public void onResume(Activity activity) {
        Log.d(TAG, "onResume");
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onResume();
        }
    }

    @Override
    public void onPause(Activity activity) {
        Log.d(TAG, "onPause");
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onPause();
        }
    }

    @Override
    public void onStop(Activity activity) {
        Log.d(TAG, "onStop");
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onStop();
        }
    }

    @Override
    public void onDestroy(Activity activity) {
        Log.d(TAG, "onDestroy");
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onDestroy();
            this.voiceActivityProxy = null;
        }
    }
}
