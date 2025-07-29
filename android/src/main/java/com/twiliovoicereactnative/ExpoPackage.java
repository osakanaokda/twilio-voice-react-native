package com.twiliovoicereactnative;

import android.content.Context;
import java.util.Collections;
import java.util.List;

import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import expo.modules.core.interfaces.ApplicationLifecycleListener;

/**
 * ExpoPackage - Expoモジュールを定義するパッケージ
 * このクラスはExpoランタイムに、このライブラリで定義されたライフサイクルリスナーを登録します
 */
public class ExpoPackage implements Package {
    @Override
    public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
        // ActivityLifecycleListenerを登録
        return Collections.singletonList(new ExpoActivityLifecycleListener());
    }

    @Override
    public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context applicationContext) {
        // ApplicationLifecycleListenerを登録
        return Collections.singletonList(new ExpoApplicationLifecycleListener());
    }
}
