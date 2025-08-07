package com.twiliovoicereactnative

import android.content.Context
import com.twilio.voice.ConnectOptions
import com.twiliovoicereactnative.CallRecordDatabase.CallRecord
import com.twiliovoicereactnative.CallRecordDatabase
import com.twiliovoicereactnative.CallListenerProxy
import com.twiliovoicereactnative.VoiceApplicationProxy
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

import java.util.HashMap
import java.util.UUID

// RegistrationListenerの明示クラス
class RegistrationListenerProxy(private val promise: Promise) : com.twilio.voice.RegistrationListener {
    override fun onRegistered(accessToken: String, params: String) {
        promise.resolve(true)
    }
    override fun onError(error: com.twilio.voice.RegistrationException, accessToken: String, params: String) {
        promise.reject("REGISTER_ERROR", error.message, error)
    }
}

// UnregistrationListenerの明示クラス
class UnregistrationListenerProxy(private val promise: Promise) : com.twilio.voice.UnregistrationListener {
    override fun onUnregistered(accessToken: String, params: String) {
        promise.resolve(true)
    }
    override fun onError(error: com.twilio.voice.RegistrationException, accessToken: String, params: String) {
        promise.reject("UNREGISTER_ERROR", error.message, error)
    }
}

class ExpoModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TwilioVoiceExpo")

        Function("voice_connect") { params: VoiceConnectParams ->
            val context = appContext.reactContext
            if (context == null) {
                return@Function null
            }

            val connectOptions = ConnectOptions.Builder(params.accessToken)
                .params(params.twiMLParams)
                .build()

            val uuid = UUID.randomUUID()
            val callListenerProxy = CallListenerProxy(uuid, context)

            val callRecord = CallRecordDatabase.CallRecord(
                uuid,
                VoiceApplicationProxy.getVoiceServiceApi().connect(
                    connectOptions,
                    callListenerProxy
                ),
                params.callee,
                params.twiMLParams,
                CallRecord.Direction.OUTGOING,
                params.displayName
            )
            VoiceApplicationProxy.getCallRecordDatabase().add(callRecord)
        }

        AsyncFunction("voice_register") { accessToken: String, promise: Promise ->
            val context = appContext.reactContext
            if (context == null) {
                promise.reject("NO_CONTEXT", "No React context available", null)
                return@AsyncFunction
            }
            // FCMトークン取得
            val firebaseMessaging = try {
                Class.forName("com.google.firebase.messaging.FirebaseMessaging")
            } catch (e: Exception) {
                promise.reject("NO_FIREBASE", "Firebase Messaging not found: ${e.message}", e)
                return@AsyncFunction
            }
            val getInstance = firebaseMessaging.getMethod("getInstance")
            val instance = getInstance.invoke(null)
            val getToken = firebaseMessaging.getMethod("getToken")
            val tokenTask = getToken.invoke(instance) as com.google.android.gms.tasks.Task<*>
            tokenTask.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    promise.reject("FCM_TOKEN_FAIL", "Failed to get FCM token: ${task.exception}", task.exception)
                    return@addOnCompleteListener
                }
                val fcmToken = task.result as? String
                if (fcmToken == null) {
                    promise.reject("FCM_TOKEN_NULL", "FCM token is null", null)
                    return@addOnCompleteListener
                }
                try {
                    val voiceClass = Class.forName("com.twilio.voice.Voice")
                    val regChannel = voiceClass.getField("RegistrationChannel").get(null)
                    val fcmEnum = regChannel.javaClass.getField("FCM").get(regChannel)
                    val register = voiceClass.getMethod("register", String::class.java, fcmEnum.javaClass, String::class.java, Class.forName("com.twilio.voice.RegistrationListener"))
                    val listenerProxy = RegistrationListenerProxy(promise)
                    register.invoke(null, accessToken, fcmEnum, fcmToken, listenerProxy)
                } catch (e: Exception) {
                    promise.reject("REGISTER_FAIL", "Voice.register failed: ${e.message}", e)
                }
            }
        }

        AsyncFunction("voice_unregister") { accessToken: String, promise: Promise ->
            val context = appContext.reactContext
            if (context == null) {
                promise.reject("NO_CONTEXT", "No React context available", null)
                return@AsyncFunction
            }
            val firebaseMessaging = try {
                Class.forName("com.google.firebase.messaging.FirebaseMessaging")
            } catch (e: Exception) {
                promise.reject("NO_FIREBASE", "Firebase Messaging not found: ${e.message}", e)
                return@AsyncFunction
            }
            val getInstance = firebaseMessaging.getMethod("getInstance")
            val instance = getInstance.invoke(null)
            val getToken = firebaseMessaging.getMethod("getToken")
            val tokenTask = getToken.invoke(instance) as com.google.android.gms.tasks.Task<*>
            tokenTask.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    promise.reject("FCM_TOKEN_FAIL", "Failed to get FCM token: ${task.exception}", task.exception)
                    return@addOnCompleteListener
                }
                val fcmToken = task.result as? String
                if (fcmToken == null) {
                    promise.reject("FCM_TOKEN_NULL", "FCM token is null", null)
                    return@addOnCompleteListener
                }
                try {
                    val voiceClass = Class.forName("com.twilio.voice.Voice")
                    val regChannel = voiceClass.getField("RegistrationChannel").get(null)
                    val fcmEnum = regChannel.javaClass.getField("FCM").get(regChannel)
                    val unregister = voiceClass.getMethod("unregister", String::class.java, fcmEnum.javaClass, String::class.java, Class.forName("com.twilio.voice.UnregistrationListener"))
                    val listenerProxy = UnregistrationListenerProxy(promise)
                    unregister.invoke(null, accessToken, fcmEnum, fcmToken, listenerProxy)
                } catch (e: Exception) {
                    promise.reject("UNREGISTER_FAIL", "Voice.unregister failed: ${e.message}", e)
                }
            }
        }
    }
}
