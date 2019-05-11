const fs = require('fs');
const HELPER = require('../utils/helper');
const error = require('../utils/error');
const inject = require('../utils/inject');

module.exports = async (cmd) => {

    const DIRECTORY = {
        current: process.cwd(),
        m5: HELPER.getm5Path(__dirname)
    }

    class CreateReactNative {

        constructor(cmd, dir) {
            this.data = {
                cmd: cmd,
                dir: dir,
                projectName: HELPER.validateName(cmd.name, true),
                projectPath: `${dir.current}/${HELPER.validateName(cmd.name, true)}`,
            };
            this.run = {};
        }

        async initReactNative(data) {
            if (!fs.existsSync(data.projectPath)) {
                if ( data.cmd.version){
                    return await HELPER.execAsync(`react-native init --version="${data.cmd.version}" ${data.projectName}`)
                }else{
                    return await HELPER.execAsync(`react-native init ${data.projectName}`)
                }
            } else {
                return "exists"
            }
        }

        async initPod(data) {
            return await HELPER.execAsync(`cd ${data.projectPath}/ios && pod init`)
        }

        async updatePod(data) {
            // let podContent = HELPER.getFileContentFromM5(data, "files/Podfile");
            let podContent = inject['Podfile'];
            let appJsonContent = HELPER.getFileContentFromProject(data, "app.json");

            let appJsonObject = HELPER.jsonToObject(appJsonContent);

            podContent = podContent.replace(/__APP_NAME__/gi, function (res) {
                return `${appJsonObject.name}`;
            });

            return fs.writeFileSync(`${data.projectPath}/ios/Podfile`, podContent, 'utf8');
        }

        async installPod(data){
            return await HELPER.execAsync(`cd ${data.projectPath}/ios && pod install`)
        }

        async updateGitignore(data) {
            let gitignore = HELPER.getFileContentFromProject(data, ".gitignore");
            if ((/ios\/Pods/).test(gitignore)){
                console.log("Is Exist, do not create more")
            }else{
                gitignore = gitignore + "\nios/Pods"
                return fs.writeFileSync(`${data.projectPath}/.gitignore`, gitignore, 'utf8');
            }
        }
        
        async updateScripts(data){

            const packageJsonContent = HELPER.getFileContentFromProject(data, "package.json");
            let packageJsonContentObj = JSON.parse(packageJsonContent);
            
            packageJsonContentObj["scripts"]["android"] = "react-native run-android";
            packageJsonContentObj["scripts"]["a"] = "yarn android";
            packageJsonContentObj["scripts"]["ios"] = "react-native run-ios";
            packageJsonContentObj["scripts"]["i"] = "yarn ios";
            packageJsonContentObj["scripts"]["i8"] = "react-native run-ios --simulator='iPhone 8'";
            packageJsonContentObj["scripts"]["reload"] = "adb shell input keyevent 82";
            packageJsonContentObj["scripts"]["r"] = "yarn reload";
            packageJsonContentObj["scripts"]["clean-watch"] = "watchman watch-del-all && rm -rf $TMPDIR/react-native-packager-cache-* && rm -rf $TMPDIR/metro-bundler-cache-*";
            packageJsonContentObj["scripts"]["cw"] = "yarn clean-watch";
            packageJsonContentObj["scripts"]["clean-package"] = "rm -rf node_modules/ && npm cache verify && yarn install";
            packageJsonContentObj["scripts"]["cp"] = "yarn clean-package";
            packageJsonContentObj["scripts"]["pod"] = "cd ios && pod install";
            packageJsonContentObj["scripts"]["clean-android"] = "rm -rf android/app/build && cd android && ./gradlew clean";
            packageJsonContentObj["scripts"]["ca"] = "yarn clean-android";
            packageJsonContentObj["scripts"]["clean-ios"] = "cd ios && rm -rf Pods/ && rm -rf build/ && rm Podfile.lock && pod install";
            packageJsonContentObj["scripts"]["ci"] = "yarn clean-ios";

            fs.writeFileSync(`${data.projectPath}/package.json`, JSON.stringify(packageJsonContentObj, null, 2), 'utf8');

        }

        async addEditorConfig(data){
            // const editorconfigContent = HELPER.getFileContentFromM5(data, "files/.editorconfig");
            const editorconfigContent = inject['editorconfig'];

            fs.writeFileSync(`${data.projectPath}/.editorconfig`, editorconfigContent, 'utf8');
        }

        async runCmd(){
            const { data } = this;
            this.run["initReactNative"] = await this.initReactNative(data);
            if (this.run["initReactNative"] != "exists"){
                this.run["initPod"] = await this.initPod(data);
                this.run["updatePod"] = await this.updatePod(data);
                this.run["installPod"] = await this.installPod(data);
                this.run["updateGitignore"] = await this.updateGitignore(data);
                this.run["updateScripts"] = await this.updateScripts(data);
                this.run["addEditorConfig"] = await this.addEditorConfig(data);
            }else{
                error(`Project ${data.projectName} is exist`, 1);
            }
        }

        init() {
            this.runCmd();
        }
    }

    const runRN = new CreateReactNative(cmd, DIRECTORY);
    runRN.init();

}
