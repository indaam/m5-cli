const inject = {};
const reactNativeMapsDependencies = `
    implementation(project(':react-native-maps')){
       exclude group: 'com.google.android.gms', module: 'play-services-base'
       exclude group: 'com.google.android.gms', module: 'play-services-maps'
    }
    implementation 'com.google.android.gms:play-services-base:16.0.0'
    implementation 'com.google.android.gms:play-services-maps:16.0.0'
`;

const reactNativeMapsMetadata = `
    <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="__PLUGIN_KEY__"/>
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

const reactNativeCameraUserermissions = `
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
`;

inject["react-native-maps"] = {
    "google-services" : false,
    "com.google.android.gms": ["play-services-base", "play-services-maps"],
    "files": [{
        'type': "android",
        "filePath": "android/app/build.gradle",
        "content": reactNativeMapsDependencies,
        'delete': `implementation project(':react-native-maps')`,
        'addType': `after`,// before | after | firstline | lastline
        'regex': /dependencies\s{/gi
    },
    {
        'type': "android",
        "filePath": "android/app/src/main/AndroidManifest.xml",
        "content": reactNativeMapsMetadata,
        'addType': `before`,// before | after | firstline | lastline
        'regex': /<\/application>/gi
    }]
}

inject["task-wrapper"] = {
    files : [{
        'type': "android",
        "filePath": "android/build.gradle",
        "content": taskWrapper,
        'addType': `lastline`,
    }]
}

inject["google-services"] = {
    files : [{
        'type': "android",
        "filePath": "android/build.gradle",
        "content": `\n\t\tclasspath 'com.google.gms:google-services:4.0.1';`,
        'addType': `after`,
        'regex': /classpath(\s)'com.android.tools.build:gradle:(\d){1,3}.(\d){1,3}.(\d){1,3}'/gi
    },
    {
        'type': "android",
        "filePath": "android/app/build.gradle",
        "content": `apply plugin: 'com.google.gms.google-services'`,
        'addType': `lastline`,
    }]
}

inject["react-native-gesture-handler"] = {
    "google-services": false,
    "files" : [{
        'type': "android",
        "filePath": "android/app/src/main/java/com/__APP_NAME__/MainActivity.java",
        "content": reactNativeGestureHandlerActivityDelegate,
        'addType': `after`,
        "regex": /getMainComponentName\(\)(\s?){([^}]+)}/gi
    },
    {
        'type': "android",
        "filePath": "android/app/src/main/java/com/__APP_NAME__/MainActivity.java",
        "content": reactNativeGestureHandlerImportActivity,
        'addType': `after`,
        "regex": /com.facebook.react.ReactActivity;/gi
    }]
}

inject["react-native-gesture-camera"] = {
    "google-services": true,
    "task-wrapper": true,
    "files" : [{
        'type': "android",
        "filePath": "android/gradle.properties",
        "content": `org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=1g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8`,
        'addType': `lastline`,
    },
    {
        'type': "android",
        "filePath": "android/app/build.gradle",
        "content": `missingDimensionStrategy 'react-native-camera', 'mlkit'`,
        'addType': `after`,
        'regex': /compileSdkVersion(\s)rootProject\.ext\.compileSdkVersion/gi
    },
    {
        'type': "android",
        "filePath": "android/app/build.gradle",
        "content": reactNativeCameraPackagingOptions,
        'addType': `after`,
        'regex': /buildTypes(\s){([^}]+)}([^}]+)}/gi
    },
    {
        'type': "android",
        "filePath": "android/app/src/main/AndroidManifest.xml",
        "content": reactNativeCameraUserermissions,
        'addType': `after`,
        'regex': /\<uses-permission(\s)android:name="android\.permission\.INTERNET"(\s)?\/\>/gi
    }]
}


module.exports = inject
