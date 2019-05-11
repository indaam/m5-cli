const fs = require('fs');
const sh = require("shelljs");
const HELPER = require('../utils/helper');
const error = require('../utils/error');
const inject = require('../utils/inject');
const { exec } = require('child_process');
const BaseClass = require('./BaseClass');

module.exports = async (cmd) => {

    // Set default version plugins
    const defaultVersion = {
        "react-native-maps" : "0.24.2",
        "react-native-gesture-handler": "1.1.0",
        "react-native-svg": "9.4.0",
        "react-native-camera": "2.6.0",
        "react-native-contacts": "4.0.1",
        "react-native-svg": "9.4.0",
        "react-native-device-info": "1.6.1",
        "lottie-react-native": "2.6.1",
        "react-native-fbsdk": "0.8.0",
    }

    class AddPlugins extends BaseClass{

        constructor(params) {
            super()
            this.info = {...params, ...{version : defaultVersion}};
            this.config = {};
            this.run = {};
        }

        async setConfig(info){
            const isInstallOnPackage = await this.isInstallOnPackage(info)
            const isLink = await this.isLink(info)
            const hasGoogleServiceJson = await this.hasGoogleServiceJson(info)
            const hasGoogleServicePlist = await this.hasGoogleServicePlist(info)
            const isGoogleServiceInstall = await this.isGoogleServiceInstall(info)
            const isFirebaseInstall = await this.isFirebaseInstall(info)
            const isTaskWrapperInstall = await this.isTaskWrapperInstall(info)
            const isSetup = await this.isSetup(info)
            this.config = {
                isInstallOnPackage: isInstallOnPackage,
                isLink: isLink,
                isSetup: isSetup,
                isFirebaseInstall : isFirebaseInstall,
                isGoogleServiceInstall: isGoogleServiceInstall,
                isTaskWrapperInstall: isTaskWrapperInstall,
                hasGoogleServiceJson: hasGoogleServiceJson,
                hasGoogleServicePlist: hasGoogleServicePlist,
                update : { ...inject[info.pluginName]}
            }
            return 1
        }

        async isInstallOnPackage(info) {
            const { packageJson, pluginName } = info;
            if (packageJson["dependencies"][pluginName]){
                return true
            }
            return false
        }

        async isLink(info) {
            const fileContent = HELPER.getFileContentFromProject(info, '/android/settings.gradle');
            const regex = new RegExp(info.pluginName, "gm");
            return regex.test(fileContent);
        }

        async isSetup(info) {
            const fileContent = HELPER.getFileContentFromProject(info, '/android/app/build.gradle');
            const regex = new RegExp(`M5 START ${info.pluginName}`, "gm");
            return regex.test(fileContent);
        }

        async hasGoogleServiceJson(info) {
            return fs.existsSync(info.projectPath + "/android/app/google-services.json")
        }

        async hasGoogleServicePlist(info) {
            return fs.existsSync(info.projectPath + "/ios/"+info.appJson.name+"/GoogleService-Info.plist")
        }

        async isGoogleServiceInstall(info){
            const fileContent = HELPER.getFileContentFromProject(info, "android/build.gradle");
            const check = /classpath(\s)('|")com\.google\.gms\:google\-services\:(\d){1,2}\.(\d){1,2}\.(\d){1,2}('|")/gi
            return check.test(fileContent);
        }

        async isFirebaseInstall(info){
            const fileContent = HELPER.getFileContentFromProject(info, "ios/"+info.appJson.name+"/AppDelegate.m");
            const check = /Firebase/gi
            return check.test(fileContent);
        }

        async isTaskWrapperInstall(info) {
            const fileContent = HELPER.getFileContentFromProject(info, "android/build.gradle");
            const check = /task(\s)wrapper\(type\:(\s)Wrapper\)(\s){/gi
            return check.test(fileContent);
        }

        async setup(info, config){
            HELPER.message("RUN setup");
            if (!config.isInstallOnPackage){
                await this.installPackage(info)
            }
            if (!config.isLink){
                await this.linkPackage(info)
            }

            if (!config.isLink) {
                const wait = await this.timeout(3000);
                if (wait){
                    await this.setupAndroidAndiOs(info, config)
                }
            }else{
                await this.setupAndroidAndiOs(info, config)
            }

        }

        async setupAndroidAndiOs(info, config){
            HELPER.message("RUN setupAndroidAndiOs");
            if (!config.isGoogleServiceInstall) {
                if (config.update["google-services"]) {
                    await this.setupGoogleServices(info)
                }
            }

            if (!config.isFirebaseInstall) {
                if (config.update["firebase"]) {
                    await this.setupFirebase(info)
                }
            }

            if (!config.isTaskWrapperInstall) {
                if (config.update["task-wrapper"]) {
                    await this.setupTaskWrapper(info)
                }
            }

            if (!config.isSetup){
                if (config.update["files"]) {
                    await this.setupFileUpdate(info, config)
                    // iTodo
                    await this.setAndroidPermissions(info, config)
                }
            }

        }

        async setMessage(info, config){
            if (config.update["google-services"] && !config.hasGoogleServiceJson) {
                HELPER.message("", "warning", function() {
                    console.log('\x1b[33m')
                    console.log("!IMPORTANT");
                    console.log(`${info.pluginName} is require google service!`);
                    console.log(`Need to put google.service.json on android/app/here...`);
                    console.log(`Read this : https://firebase.google.com/docs/android/setup#add-config-file`);
                    console.log('\x1b[0m');                    
                })
            }
            if (config.update["firebase"] && !config.hasGoogleServicePlist) {
                HELPER.message("", "warning", function() {
                    console.log('\x1b[33m')
                    console.log("!IMPORTANT");
                    console.log(`${info.pluginName} is require firebase!`);
                    console.log(`Need to put GoogleService-Info.plist on ios/${info.appJson.name}/here...`);
                    console.log(`Read this : https://firebase.google.com/docs/ios/setup#add_firebase_to_your_app`);
                    console.log('\x1b[0m');                    
                })
            }
            if(info.pluginName == "react-native-maps"){
                HELPER.message(`!IMPORTANT\nThis plugins need to anable google maps api library, \nGoto : https://console.developers.google.com/apis/library`, "warning");
            }
            this.end(info, config);
        }

        async installPackage(info) {
            HELPER.message("RUN installPackage");
            // iTodo, check when error network
            const version = HELPER.getPluginVersion(info);
            if( version ){
                return await HELPER.execAsync(`yarn add ${info.pluginName}@${version}`);
            }else{
                HELPER.message(`Error ${info.pluginName} not ready on m5 cli`, "error");
            }
        }

        async linkPackage(info) {
            HELPER.message("RUN linkPackage");
            return new Promise(function (resolve, reject) {
                sh.exec(`osascript -e 'tell app "Terminal"
            do script "cd ${info.projectPath} && react-native link ${info.pluginName}"
        end tell'
            `, (err, stdout, stderr) => {
                    if (err) {
                        return;
                    }
                    HELPER.message("END linkPackage");
                    resolve(stdout)
                });

            })

        }

        async setupGoogleServices(info){
            HELPER.message("RUN setupGoogleServices");
            const { files } = inject["google-services"];
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                await this.updateFile({
                    info: info,
                    file: file,
                    index: index,
                    name: "google-services"
                });
            }
        }

        async setupFirebase(info){
            HELPER.message("RUN setupFirebase");
            const { files } = inject["firebase"];
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                await this.updateFile({
                    info: info,
                    file: file,
                    index: index,
                    name: "firebase"
                });
            }
        }

        async setupTaskWrapper(info) {
            HELPER.message("RUN setupTaskWrapper");
            const { files } = inject["task-wrapper"];
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                await this.updateFile({
                    info: info,
                    file: file,
                    index: index,
                    name: "task-wrapper"
                });
            }
        }

        async setupFileUpdate(info, config){
            HELPER.message("RUN setupFileUpdate");
            const { files } = config["update"];
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                await this.updateFile({
                    info: info,
                    file: file,
                    index: index,
                    name: info.pluginName
                });
            }
        }

        async updateFile(params){
            const { info, file, index, name } = params;
            let { filePath, content, updateType, regex, remove } = file;
            filePath = HELPER.validateFilePath(info, filePath);
            let extention = HELPER.getExtention(filePath);
            let fileContent = HELPER.getFileContentFromProject(info, filePath);

            if (remove){
                fileContent = fileContent.replace(remove, "");
            }

            fileContent = HELPER.findThenUpdateContent({
                regex: regex,
                fileContent: content,
                originalContent: fileContent,
                updateType: updateType,
                commentDisplay: true,
                commentType: extention,
                commentMsg: `${name} ${index}`,
            });

            if (info.pluginKey) {
                fileContent = fileContent.replace(/__PLUGIN_KEY__/gm, info.pluginKey)
            }

            HELPER.message(`RUN updateFile ${name} ${index}`);

            fs.writeFileSync(`${info.projectPath}/${filePath}`, fileContent, 'utf8');

        }

        end(info, config){
            if( config.isSetup){
                HELPER.message(`IS ALREADY SETUP ${(info.pluginName).toUpperCase()}`, 'warning');
            }else{
                HELPER.message(`SUCCESS SETUP ${(info.pluginName).toUpperCase()}.\nTry, m5 demo && react-native run-ios or react-native run-android to see the demo`, 'success');
            }
        }

        async updateAppJson(info, config){
            HELPER.message("RUN updateAppJson");
            let appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
            const appJson = HELPER.jsonToObject(appJsonContent);

            if (appJson["nativePlugins"]){
                appJson["nativePlugins"][info.pluginName] = HELPER.getPluginsName(info);
            }else{
                appJson["nativePlugins"] = {};
                appJson["nativePlugins"][info.pluginName] = HELPER.getPluginsName(info);
            }

            fs.writeFileSync(`${info.projectPath}/app.json`, JSON.stringify(appJson, null, 2), 'utf8');
        }

        async updatePod(info, config){
            HELPER.message("RUN updatePod");
            return await HELPER.execAsync(`cd ${info.projectPath}/ios && pod install`)
        }

        // git checkout android/ && m5 add react-native-contacts

        async updateUsesPermissions(info, data){
            const usesPermissions = HELPER.generateUsesPermissions(data);
            let androidManifestContent = HELPER.getFileContentFromProject(info, "android/app/src/main/AndroidManifest.xml");

            androidManifestContent = androidManifestContent.replace(/\<uses-permission[^>]+"(\s)?\/>\n/gi, "");
            
            androidManifestContent = HELPER.findThenUpdateContent({
                regex : /\<manifest[^>]+\"\>/gi,
                fileContent: usesPermissions,
                originalContent: androidManifestContent,
                updateType: "after",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });
            return fs.writeFileSync(`${info.projectPath}/android/app/src/main/AndroidManifest.xml`, androidManifestContent, 'utf8');
        }

        async setAndroidPermissions(info, config){
            const { update } = config;
            if( update && update["uses-permission"]){
                let androidManifest = HELPER.getFileContentFromProject(info, "android/app/src/main/AndroidManifest.xml");
                const permissionsList  = HELPER.getPermissionsList(androidManifest);
                const updatePermissionsList = [...permissionsList, ...update["uses-permission"]];
                return await this.updateUsesPermissions(info, updatePermissionsList)
            }
            return 1
        }

        async runCmd(){
            const { info } = this;
            this.run["updateInfo"] = await this.updateInfo(info);
            this.run["setConfig"] = await this.setConfig(info);
            const { config } = this;
            this.run["setup"] = await this.setup(info, config);
            this.run["updateAppJson"] = await this.updateAppJson(info, config);
            this.run["updatePod"] = await this.updatePod(info, config);
            this.run["setMessage"] = await this.setMessage(info, config);
            return 1
        }

        async init() {
            await this.runCmd();
        }
    }

    const runPlugins = new AddPlugins({
        cmd : cmd,
        dir : HELPER.getDir()
    });

    return await runPlugins.init();

}
