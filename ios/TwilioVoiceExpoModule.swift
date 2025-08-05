import ExpoModulesCore
import Foundation
import React

public class TwilioVoiceExpoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TwilioVoiceExpo")

    AsyncFunction("connect") { (accessToken: String, twiMLParams: [String: String]?, promise: Promise) in
      if let bridge = RCTBridge.current() {
        let module = bridge.module(forName: "TwilioVoiceReactNative") as? NSObject
        let selector = NSSelectorFromString("connect:params:resolver:rejecter:")
        if let module = module, module.responds(to: selector) {
          let _ = module.perform(selector, with: accessToken, with: twiMLParams ?? [:])
          promise.resolve(true)
        } else {
          promise.reject("NO_MODULE", "TwilioVoiceReactNative module not found or method missing")
        }
      } else {
        promise.reject("NO_BRIDGE", "RCTBridge not found")
      }
    }

    AsyncFunction("register") { (accessToken: String, deviceToken: String, promise: Promise) in
      if let bridge = RCTBridge.current() {
        let module = bridge.module(forName: "TwilioVoiceReactNative") as? NSObject
        let selector = NSSelectorFromString("register:deviceToken:resolver:rejecter:")
        if let module = module, module.responds(to: selector) {
          let _ = module.perform(selector, with: accessToken, with: deviceToken)
          promise.resolve(true)
        } else {
          promise.reject("NO_MODULE", "TwilioVoiceReactNative module not found or method missing")
        }
      } else {
        promise.reject("NO_BRIDGE", "RCTBridge not found")
      }
    }

    AsyncFunction("unregister") { (accessToken: String, deviceToken: String, promise: Promise) in
      if let bridge = RCTBridge.current() {
        let module = bridge.module(forName: "TwilioVoiceReactNative") as? NSObject
        let selector = NSSelectorFromString("unregister:deviceToken:resolver:rejecter:")
        if let module = module, module.responds(to: selector) {
          let _ = module.perform(selector, with: accessToken, with: deviceToken)
          promise.resolve(true)
        } else {
          promise.reject("NO_MODULE", "TwilioVoiceReactNative module not found or method missing")
        }
      } else {
        promise.reject("NO_BRIDGE", "RCTBridge not found")
      }
    }
  }
}
