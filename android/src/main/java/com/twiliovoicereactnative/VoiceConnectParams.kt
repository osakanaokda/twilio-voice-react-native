package com.twiliovoicereactnative

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class VoiceConnectParams : Record {
    @Field
    var accessToken: String = ""
    @Field
    var callee: String = "Callee"
    @Field
    var twiMLParams: HashMap<String, String> = HashMap()
    @Field
    var displayName: String = "Display Name"
}
