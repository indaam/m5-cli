const inject = {};

const reactNativeContactsInfoPlist = `
    <key>NSContactsUsageDescription</key>
    <string></string>
`;

const reactNativeContactsProGuard = `
-keep class com.rt2zz.reactnativecontacts.** {*;}
-keepclassmembers class com.rt2zz.reactnativecontacts.** {*;}
`;

const reactNativeCameraInfoPlist = `
	<key>NSCameraUsageDescription</key>
	<string>This app needs camera access to show off</string>

	<!-- Include this only if you are planning to use the camera roll -->
	<key>NSPhotoLibraryUsageDescription</key>
	<string>This app need library access so you can add pictures</string>

	<!-- Include this only if you are planning to use the microphone for video recording -->
	<key>NSMicrophoneUsageDescription</key>
	<string>This app needs access to microphone for video recording</string>
`;

const reactNativeMapsDependencies = `
    implementation(project(':react-native-maps')){
       exclude group: 'com.google.android.gms', module: 'play-services-base'
       exclude group: 'com.google.android.gms', module: 'play-services-maps'
    }
    implementation 'com.google.android.gms:play-services-base:16.0.0'
    implementation 'com.google.android.gms:play-services-maps:16.0.0'
`;

const ReactNativeDeviceInfoDependencies = `
    implementation(project(':react-native-device-info')){
        exclude group: 'com.google.android.gms', module: 'play-services-gcm'
    }
    implementation 'com.google.android.gms:play-services-gcm:16.0.0'
`;

const reactNativeMapsMetadata = `
    <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="__PLUGIN_KEY__"/>
`;

const reactNativeMapsPod = `
pod 'react-native-google-maps', :path => '../node_modules/react-native-maps'
pod 'GoogleMaps'
pod 'Google-Maps-iOS-Utils'
`;

const reactNativeCameraPod = `
pod 'react-native-camera', :path => '../node_modules/react-native-camera', subspecs: [
    'TextDetector',
    'FaceDetectorMLKit',
    'BarcodeDetectorMLKit'
  ]
`;

const reactNativeGestureHandlerActivityDelegate = `
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }
`;

const taskWrapper = `
    task wrapper(type: Wrapper) {
        gradleVersion = '4.7'
        distributionUrl = distributionUrl.replace("bin", "all")
    }
`;

const reactNativeGestureHandlerImportActivity = `
    import com.facebook.react.ReactActivityDelegate;
    import com.facebook.react.ReactRootView;
    import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
`;

const reactNativeCameraPackagingOptions = `
    packagingOptions {
        exclude 'META-INF/proguard/androidx-annotations.pro'
        exclude 'META-INF/androidx.exifinterface_exifinterface.version'
    }
`;

const lottieReactNativePod = `
    pod 'lottie-react-native', :path => '../node_modules/lottie-react-native'
    pod 'lottie-ios', :path => '../../node_modules/lottie-ios'
`;


inject["task-wrapper"] = {
    files: [
        {
            'type': "android",
            "filePath": "android/build.gradle",
            "content": taskWrapper,
            'updateType': `lastline`,
        }]
}

inject["firebase"] = {
    files: [
        {
            'type': "ios",
            "filePath": "ios/__APP_NAME__/AppDelegate.m",
            "content": `#import <Firebase.h>`,
            'regex': /\#import(\s)\"AppDelegate\.h\"/gi,
            'updateType': `after`,
        },
        {
            'type': "ios",
            "filePath": "ios/__APP_NAME__/AppDelegate.m",
            "content": `[FIRApp configure];`,
            'regex': /rootView\.backgroundColor/gi,
            'updateType': `before`,
        },
        {
            'type': "ios",
            "filePath": "ios/Podfile",
            "content": `pod 'Firebase/Core'`,
            'regex': /third\-party\-podspecs\/Folly\.podspec("|')/gi,
            'updateType': `after`,
        }
    ]
}

inject["google-services"] = {
    "files": [
        {
            'type': "android",
            "filePath": "android/build.gradle",
            "content": `\n\t\tclasspath 'com.google.gms:google-services:4.0.1';`,
            'updateType': `after`,
            'regex': /classpath(\s)'com.android.tools.build:gradle:(\d){1,3}.(\d){1,3}.(\d){1,3}'/gi
        },
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": `apply plugin: 'com.google.gms.google-services'`,
            'updateType': `lastline`,
        }]
}

inject["react-native-maps"] = {
    "google-services": false,
    "com.google.android.gms": ["play-services-base", "play-services-maps"],
    "files": [
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": reactNativeMapsDependencies,
            'updateType': `replace`,// before | after | firstline | lastline
            'regex': /implementation(\s)project\(\':react-native-maps\'\)/gi
        },
        {
            'type': "android",
            "filePath": "android/app/src/main/AndroidManifest.xml",
            "content": reactNativeMapsMetadata,
            'updateType': `before`,// before | after | firstline | lastline
            'regex': /<\/application>/gi
        },
        {
            'type': "ios",
            "filePath": "ios/Podfile",
            "content": reactNativeMapsPod,
            'updateType': `after`,// before | after | firstline | lastline
            'regex': /\'..\/node_modules\/react-native-maps\'/gi
        },
        {
            'type': "ios",
            "filePath": "ios/__APP_NAME__/AppDelegate.m",
            "content": `#import <GoogleMaps/GoogleMaps.h>`,
            'updateType': `after`,// before | after | firstline | lastline
            'regex': /\<React\/RCTRootView\.h\>/gi
        },
        {
            'type': "ios",
            "filePath": "ios/__APP_NAME__/AppDelegate.m",
            "content": `[GMSServices provideAPIKey:@"__PLUGIN_KEY__"];`,
            'updateType': `before`,// before | after | firstline | lastline
            'regex': /rootView\.backgroundColor/gi
        }
    ]
}

inject["react-native-gesture-handler"] = {
    "google-services": false,
    "files": [
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": `implementation project(':react-native-gesture-handler')`,
            'updateType': `replace`,
            "regex": /implementation(\s)project\(\':react-native-gesture-handler\'\)/gi
        },
        {
            'type': "android",
            "filePath": "android/app/src/main/java/com/__APP_NAME__/MainActivity.java",
            "content": reactNativeGestureHandlerActivityDelegate,
            'updateType': `after`,
            "regex": /getMainComponentName\(\)(\s?){([^}]+)}/gi
        },
        {
            'type': "android",
            "filePath": "android/app/src/main/java/com/__APP_NAME__/MainActivity.java",
            "content": reactNativeGestureHandlerImportActivity,
            'updateType': `after`,
            "regex": /com.facebook.react.ReactActivity;/gi
        }]
}

inject["react-native-camera"] = {
    "firebase": true,
    "google-services": true,
    "task-wrapper": true,
    "uses-permission" : ["SYSTEM_ALERT_WINDOW", "CAMERA", "RECORD_AUDIO", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
    "files": [
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": `implementation project(':react-native-camera')`,
            'updateType': `replace`,
            "regex": /implementation(\s)project\(\':react-native-camera\'\)/gi
        },
        {
            'type': "android",
            "filePath": "android/gradle.properties",
            "content": `org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=1g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8`,
            'updateType': `lastline`,
        },
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": `    missingDimensionStrategy 'react-native-camera', 'mlkit'`,
            'updateType': `after`,
            'regex': /targetSdkVersion(\s)rootProject\.ext\.targetSdkVersion/gi
        },
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": reactNativeCameraPackagingOptions,
            'updateType': `after`,
            'regex': /buildTypes(\s){([^}]+)}([^}]+)}/gi
        },
        {
            'type': "ios",
            "filePath": "ios/Podfile",
            "content": reactNativeCameraPod,
            'updateType': `replace`,
            'regex': /pod(\s)\'react-native-camera\'\,(\s):path =>(\s)\'..\/node_modules\/react-native-camera\'/gi
        },
        {
            'type': "ios",
            "filePath": "ios/__APP_NAME__/Info.plist",
            "content": reactNativeCameraInfoPlist,
            'updateType': `after`,
            'regex': /\<string\>UIInterfaceOrientationLandscapeRight<\/string\>([^((y)>)]+)y\>/gi
        }
    ]
}

inject["react-native-contacts"] = {
    "firebase": false,
    "google-services": false,
    "task-wrapper": false,
    "uses-permission" : ["WRITE_CONTACTS", "READ_PROFILE", "WRITE_PROFILE"],
    "files": [
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": `implementation project(':react-native-contacts')`,
            'updateType': `replace`,
            "regex": /implementation(\s)project\(\':react-native-contacts\'\)/gi
        },
        {
            'type': "android",
            "filePath": "android/app/proguard-rules.pro",
            "content": reactNativeContactsProGuard,
            'updateType': `lastline`,
        },
        {
            'type': "ios",
            "filePath": "ios/__APP_NAME__/Info.plist",
            "content": reactNativeContactsInfoPlist,
            'updateType': `after`,
            'regex': /\<key\>NSLocationWhenInUseUsageDescription<\/key\>\s+(\<string\><\/string\>)/gm
        }
    ]
}

inject["react-native-svg"] = {
    "firebase": false,
    "google-services": false,
    "task-wrapper": false,
    "files": [
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": `implementation project(':react-native-svg')`,
            'updateType': `replace`,
            "regex": /implementation(\s)project\(\':react-native-svg\'\)/gi
        }
    ]
}

inject["react-native-device-info"] = {
    "firebase": false,
    "google-services": false,
    "uses-permission": ["ACCESS_WIFI_STATE", "READ_PHONE_STATE", "BLUETOOTH"],
    "files": [
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": ReactNativeDeviceInfoDependencies,
            'updateType': `replace`,
            "regex": /implementation(\s)project\(\':react-native-device-info\'\)/gi
        }
    ]
}


inject["lottie-react-native"] = {
    "firebase": false,
    "google-services": false,
    "task-wrapper": false,
    "message" : 'After this, open the Xcode project configuration and add the Lottie.framework as Embedded Binaries.',
    "files": [
        {
            'type': "android",
            "filePath": "android/app/build.gradle",
            "content": `implementation project(':lottie-react-native')`,
            'updateType': `replace`,
            "regex": /implementation(\s)project\(\':lottie-react-native\'\)/gi
        },
        {
            'type': "ios",
            "filePath": "ios/Podfile",
            "content": lottieReactNativePod,
            'updateType': `replace`,
            'regex': /pod(\s)\'lottie-react-native\'(.*)modules\/lottie-react-native\'/gi
        }
    ]
}

module.exports = inject
