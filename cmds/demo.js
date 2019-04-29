const fs = require('fs');
const sh = require("shelljs");
const HELPER = require('../utils/helper');

module.exports = async (cmd) => {

    const DIRECTORY = {
        current: process.cwd(),
        m5: HELPER.getm5Path(__dirname)
    }

    class demo {

        constructor(cmd, dir) {
            this.data = {
                cmd: cmd,
                dir: dir,
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

        async checkDir(data){
            if (!fs.existsSync(data.dir.projectPath + "/" + "M5Demo")) {
                return {
                    "exists": 0
                }
            } else {
                return {
                    "exists": 1
                }
            } 
        }
        async cloneDemo(data){
            return await HELPER.execAsync(`cp -Rv ${data.dir.m5}/files/Demo/. ${data.projectPath}/`);
        }

        async updateIndexDemo(data){
            const { nativePlugins } = data.appJson;
            const importList = HELPER.createImportList(nativePlugins);
            const screenList = HELPER.createsSreenList(nativePlugins);
            let indexDemoContent = HELPER.getFileContentFromProject(data, "M5Demo/index.js");

            indexDemoContent = HELPER.findThenUpdateContent({
                regex: /const(\s)LandingScreen(\s)?=(\s)?createStackNavigator\(/gi,
                fileContent: importList,
                originalContent: indexDemoContent,
                updateType: "before",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });

            indexDemoContent = HELPER.findThenUpdateContent({
                regex: /const(\s)?screenList(\s)?=(\s)?{([^}]+)LandingScreen/gi,
                fileContent: "," + screenList,
                originalContent: indexDemoContent,
                updateType: "after",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });

            return fs.writeFileSync(`${data.projectPath}/M5Demo/index.js`, indexDemoContent, 'utf8');
        }

        async updateRootIndex(data){
            let indexRootContent = HELPER.getFileContentFromProject(data, "index.js");
            indexRootContent = indexRootContent.replace(/import(\s)(App)(\s)from(\s)("|')(.){1,20}('|");/gi, `import App from "./AppDemo";`)
            return fs.writeFileSync(`${data.projectPath}/index.js`, indexRootContent, 'utf8');
        }

        async updateNavList(data){
            const navList = HELPER.createObjectList(data.appJson);
            let landingDemoContent = HELPER.getFileContentFromProject(data, "M5Demo/landing.js");
            landingDemoContent = HELPER.findThenUpdateContent({
                regex: /export(\s)default(\s)class(\s)(\w){1,90}(\s)?/gi,
                fileContent: navList + ";\n",
                originalContent: landingDemoContent,
                updateType: "before",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });

            return fs.writeFileSync(`${data.projectPath}/M5Demo/landing.js`, landingDemoContent, 'utf8');
        }

        async addDefaultPackage(data){
            return await HELPER.execAsync(`cd ${data.projectPath} && yarn add react-navigation`);
        }

        async runCmd(){
            const { data } = this;
            this.run["initConfig"] = await this.initConfig(data);
            this.run["checkDir"] = await this.checkDir(this.data);
            // if (!this.run["checkDir"]["exists"]){
                this.run["cloneDemo"] = await this.cloneDemo(this.data);
                this.run["updateIndexDemo"] = await this.updateIndexDemo(this.data);
                this.run["updateRootIndex"] = await this.updateRootIndex(this.data);
                this.run["updateNavList"] = await this.updateNavList(this.data);
                this.run["addDefaultPackage"] = await this.addDefaultPackage(this.data);
            // }
        }

        init() {
            this.runCmd();
        }
    }

    const runDemo = new demo(cmd, DIRECTORY);
    runDemo.init();

}
