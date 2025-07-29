package com.twiliovoicereactnative;

import android.content.Context;
import android.util.Log;

import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.twilio.voice.CallInvite;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.Voice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import expo.modules.kotlin.modules.Module;
import expo.modules.kotlin.modules.ModuleDefinition;

/**
 * ExpoModule - Expo用のTwilio Voice SDKへのインターフェース
 * このクラスはExpo Dev Clientで使用するためのインターフェースを提供します
 */
public class ExpoModule extends Module {
    private static final String TAG = "ExpoModule";

    @Override
    public String getName() {
        return "TwilioVoiceReactNative";
    }

    @Override
    public void definition(ModuleDefinition definition) {
        // 発信関数を定義
        definition.function("voice_connect", (String accessToken, Map<String, Object> params) -> {
            Context context = getAppContext().getReactContext();
            if (context == null) {
                return null;
            }

            try {
                // パラメータをMapに変換
                Map<String, String> connectParams = new HashMap<>();
                if (params != null) {
                    for (Map.Entry<String, Object> entry : params.entrySet()) {
                        if (entry.getValue() instanceof String) {
                            connectParams.put(entry.getKey(), (String) entry.getValue());
                        }
                    }
                }

                // ConnectOptionsを作成
                ConnectOptions.Builder builder = new ConnectOptions.Builder(accessToken);
                if (!connectParams.isEmpty()) {
                    builder.params(connectParams);
                }
                ConnectOptions connectOptions = builder.build();

                // コールIDを生成
                UUID uuid = UUID.randomUUID();
                
                // コールリスナーを作成
                CallListenerProxy callListenerProxy = new CallListenerProxy(uuid, context);

                // 通話を発信
                Call call = VoiceApplicationProxy.getVoiceServiceApi().connect(connectOptions, callListenerProxy);
                
                // 通話情報をデータベースに追加
                String calleeName = params.containsKey("To") ? (String) params.get("To") : "Unknown";
                String displayName = calleeName; // 表示名

                // 通話記録を作成
                CallRecordDatabase.CallRecord callRecord = new CallRecordDatabase.CallRecord(
                    uuid,
                    call,
                    calleeName,
                    connectParams,
                    CallRecordDatabase.CallRecord.Direction.OUTGOING,
                    displayName
                );

                // データベースに追加
                VoiceApplicationProxy.getCallRecordDatabase().add(callRecord);
                
                // 通話のUUIDを返す
                return uuid.toString();
            } catch (CallException e) {
                Log.e(TAG, "Failed to make outgoing call", e);
                throw new RuntimeException("Failed to make outgoing call: " + e.getMessage());
            }
        });

        // 着信応答関数を定義
        definition.function("accept_call_invite", (String callInviteUuid) -> {
            try {
                CallInvite callInvite = findCallInviteByUuid(callInviteUuid);
                if (callInvite != null) {
                    Context context = getAppContext().getReactContext();
                    if (context == null) {
                        return false;
                    }

                    UUID uuid = UUID.fromString(callInviteUuid);
                    CallListenerProxy callListenerProxy = new CallListenerProxy(uuid, context);
                    Call call = callInvite.accept(callListenerProxy);
                    
                    // 通話情報を保存
                    String callerName = callInvite.getFrom() != null ? callInvite.getFrom() : "Unknown";
                    CallRecordDatabase.CallRecord callRecord = new CallRecordDatabase.CallRecord(
                        uuid,
                        call,
                        callerName,
                        new HashMap<>(),
                        CallRecordDatabase.CallRecord.Direction.INCOMING,
                        callerName
                    );
                    
                    VoiceApplicationProxy.getCallRecordDatabase().add(callRecord);
                    return true;
                }
                return false;
            } catch (Exception e) {
                Log.e(TAG, "Failed to accept call", e);
                return false;
            }
        });

        // 着信拒否関数を定義
        definition.function("reject_call_invite", (String callInviteUuid) -> {
            try {
                CallInvite callInvite = findCallInviteByUuid(callInviteUuid);
                if (callInvite != null) {
                    callInvite.reject();
                    return true;
                }
                return false;
            } catch (Exception e) {
                Log.e(TAG, "Failed to reject call", e);
                return false;
            }
        });

        // 通話終了関数を定義
        definition.function("disconnect_call", (String callUuid) -> {
            try {
                CallRecordDatabase.CallRecord callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(UUID.fromString(callUuid));
                if (callRecord != null && callRecord.getCall() != null) {
                    callRecord.getCall().disconnect();
                    return true;
                }
                return false;
            } catch (Exception e) {
                Log.e(TAG, "Failed to disconnect call", e);
                return false;
            }
        });

        // ミュート切り替え関数を定義
        definition.function("mute_call", (String callUuid, Boolean isMuted) -> {
            try {
                CallRecordDatabase.CallRecord callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(UUID.fromString(callUuid));
                if (callRecord != null && callRecord.getCall() != null) {
                    callRecord.getCall().mute(isMuted);
                    return true;
                }
                return false;
            } catch (Exception e) {
                Log.e(TAG, "Failed to mute/unmute call", e);
                return false;
            }
        });
    }

    // CallInviteをUUIDで検索するヘルパーメソッド
    private CallInvite findCallInviteByUuid(String callInviteUuid) {
        try {
            UUID uuid = UUID.fromString(callInviteUuid);
            // CallInviteを検索するロジックを実装
            // 実際の実装はアプリケーションの設計によって異なります
            return null; // TODO: 実際の実装に置き換える
        } catch (Exception e) {
            Log.e(TAG, "Failed to find call invite", e);
            return null;
        }
    }
}
