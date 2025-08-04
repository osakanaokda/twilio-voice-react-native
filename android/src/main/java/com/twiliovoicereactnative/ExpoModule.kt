package com.twiliovoicereactnative

import android.content.Context
import com.twilio.voice.ConnectOptions
import com.twiliovoicereactnative.CallRecordDatabase.CallRecord
import com.twiliovoicereactnative.CallRecordDatabase
import com.twiliovoicereactnative.CallListenerProxy
import com.twiliovoicereactnative.VoiceApplicationProxy
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.HashMap
import java.util.UUID

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

        Function("voice_register") { accessToken: String ->
            val context = appContext.reactContext
            if (context == null) {
                return@Function null
            } else {
                // TODO: Twilio Voice.register() を呼び出す実装に差し替えてください
                // Voice.register(accessToken, ...)
            }
        }

        Function("voice_unregister") {
            val context = appContext.reactContext
            if (context == null) {
                return@Function null
            } else {
                // TODO: Twilio Voice.unregister() を呼び出す実装に差し替えてください
                // Voice.unregister(...)
            }
        }
    }
}
