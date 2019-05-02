const fs = require('fs');
const sh = require("shelljs");
const HELPER = require('../utils/helper');
const error = require('../utils/error');
const inject = require('../utils/inject');
const { exec } = require('child_process');
module.exports = async (cmd) => {

    const DIRECTORY = {
        current: process.cwd(),
        m5: HELPER.getm5Path(__dirname)
    }

    class runTest {

        constructor(cmd, dir) {
            this.data = {
                cmd: cmd,
                dir: dir,
                pluginName: HELPER.getPluginInfo("name", cmd),
                pluginVersion: HELPER.getPluginInfo("version", cmd),
                pluginKey: HELPER.getPluginInfo("key", cmd),
                projectPath: `${dir.current}`,
            };
            this.run = {};
        }

        getPackageJson(data){
            let packageJsonContent = HELPER.getFileContentFromProject(data, "package.json");
            let packageJsonObject = HELPER.jsonToObject(packageJsonContent);
            return packageJsonObject
        }

        getAppjson(data){
            let appJsonContent = HELPER.getFileContentFromProject(data, "app.json");
            let appJsonObject = HELPER.jsonToObject(appJsonContent);
            return appJsonObject
        }

        async initConfig(data) {
            this.data["appJson"] = this.getAppjson(data);
            this.data["packageJson"] = this.getPackageJson(data);
            if (this.data["appJson"] && this.data["packageJson"]){
                return 1
            }
        }

        async checkPlugin(data) {
            const { packageJson, appJson, version} = data;
            if (packageJson["dependencies"][data.pluginName]){
                HELPER.message("ERROR, PLUGINS IS EXIST")
                error("", 1)
            }
            return 1
        }

        async installPlugin(data) {
            HELPER.message("RUN INSTALL PLUGINS");
            const version = HELPER.getPluginVersion(data);
            return await HELPER.execAsync(`yarn add ${data.pluginName}@${version}`);
        }

        async updateAndroidFile(data, val){
            const { filePath, content, addType, regex } = val;
            let fileContent = HELPER.getFileContentFromProject(data, filePath);

            if (val.delete){
                fileContent = fileContent.replace(val.delete, "");
            }

            if (val.addType == "firstline"){
                fileContent = val.content + "\n" + fileContent
            }

            if (val.addType == "lastline"){
                fileContent = fileContent + "\n" + fileContent
            }

            fileContent = fileContent.replace(regex, function (res) {
                if (addType == "before"){
                    return content + "\n" + res
                }else{
                    return res + "\n" + content
                }
            });

            if (data.pluginKey) {
                fileContent = fileContent.replace("__PLUGIN_KEY__", data.pluginKey)
            }

            fs.writeFileSync(`${data.projectPath}/${filePath}`, fileContent, 'utf8');
        }

        async setupAndroid(data) {
            HELPER.message("RUN SETUP ANDROID");
            const dataList = inject[data.pluginName];
            for (let val of dataList){
                await this.updateAndroidFile(data, val)
            }
            return 1
        }

        setPluginsValue(data){
            const version = HELPER.getPluginVersion(data);
            if (data.pluginKey){
                return {
                    "version": version,
                    "key" : data.pluginKey
                }
            }
            return version
        }

        end(data){
            HELPER.message("SUCCESS SETUP", data.pluginName)
        }

        async updateAppJson(data){
            HELPER.message("RUN UPDATE APP JSON");
            let appJsonContent = HELPER.getFileContentFromProject(data, "app.json");
            const appJson = HELPER.jsonToObject(appJsonContent);

            console.log("MEMEK");
            console.log(HELPER.createComponentName(data.pluginName))

            if (appJson["nativePlugins"]){
                appJson["nativePlugins"][data.pluginName] = this.setPluginsValue(data);
            }else{
                appJson["nativePlugins"] = {};
                appJson["nativePlugins"][data.pluginName] = this.setPluginsValue(data);
            }

            return fs.writeFileSync(`${data.projectPath}/app.json`, JSON.stringify(appJson, null, 2), 'utf8');
        }

        async linkPlugin(data) {
            // iTodo, this not close procced
            HELPER.message("RUN LINK PLUGINS");
            exec(`react-native link ${data.pluginName}`, (err, stdout, stderr) => {
                console.log(err);
                console.log(stdout);
                console.log(stderr);
                if (err) {
                    console.error(err);
                    return;
                }
                return 1
            });
            // return await HELPER.execAsync(`react-native link ${data.pluginName}`);
        }

        async createSample(data){
            HELPER.message("RUN LINK PLUGINS");
            const sampleContent = HELPER.getFileContentFromM5(data, 'files/' + data.pluginName + ".jsx");
            const componentName = HELPER.createComponentName(data.pluginName);
            fs.writeFileSync(`${data.projectPath}/${componentName}`, sampleContent, 'utf8');

            this.end(data);
            process.exit(1);

        }

        async createIndex(data){
            let appContent = HELPER.getFileContentFromM5(data, 'files/AppDemo.jsx');
            const componentName = HELPER.createComponentName(data.pluginName);

            appContent = appContent.replace("__DEMO__NAME__", componentName);

            fs.writeFileSync(`${data.projectPath}/index.js`, appContent, 'utf8');
            return 1

        }

        runReact(){
            HELPER.execAsync('react-native run-android');
        }

        async runCmd(){
            const { data } = this;
            console.log(data);
            this.run["initConfig"] = await this.initConfig(data);
            this.run["createIndex"] = await this.createIndex(this.data);

            if (this.run["createIndex"]){
                this.run["runReact"] = this.runReact();
            }

            // this.run["checkPlugin"] = await this.checkPlugin(this.data);

            // this.run["installPlugin"] = await this.installPlugin(this.data)
            // this.run["linkPlugin"] = await this.linkPlugin(this.data)
            // this.run["setupAndroid"] = await this.setupAndroid(this.data);
            // this.run["updateAppJson"] = await this.updateAppJson(this.data);

        }

        init() {
            this.runCmd();
        }
    }

    const html = new runTest(cmd, DIRECTORY);
    html.init();

}
