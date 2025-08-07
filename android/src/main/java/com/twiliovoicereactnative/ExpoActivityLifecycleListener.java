package com.twiliovoicereactnative;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import expo.modules.core.interfaces.ReactActivityLifecycleListener;

public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
    private VoiceActivityProxy voiceActivityProxy;

    @Override
    public void onCreate(Activity activity, Bundle savedInstanceState) {
        this.voiceActivityProxy = new VoiceActivityProxy(activity, new VoiceActivityProxy.PermissionsRationaleNotifier() {
            @Override
            public void displayRationale(final String permission) {
                new android.app.AlertDialog.Builder(activity)
                        .setTitle("パーミッションが必要です")
                        .setMessage(permission + " の権限が必要です。アプリの機能を利用するために許可してください。")
                        .setPositiveButton("OK", (dialog, which) -> dialog.dismiss())
                        .show();
            }
        });
        this.voiceActivityProxy.onCreate(savedInstanceState);
    }

    @Override
    public boolean onNewIntent(Intent intent) {
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onNewIntent(intent);
        }
        return false;
    }

    @Override
    public void onDestroy(Activity activity) {
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onDestroy();
        }
    }
}
