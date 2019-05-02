const fs = require('fs');
const sh = require("shelljs");
const HELPER = require('../utils/helper');
const BaseClass = require('./BaseClass');
const CONFIG = require('../config');

const demoDirName = "M5Demo";

module.exports = async (cmd) => {

    class Demo extends BaseClass {

        constructor(params){
            super()
            this.info = {...params}
        }

        async createDemoDir(info){
            HELPER.message("RUN createDemoDir");
            const exist = fs.existsSync(info.projectPath + "/" + demoDirName);
            if( !exist){
                return await this.cloneDemo(info);
            }
            return
        }

        async cloneDemo(info){
            HELPER.message("RUN cloneDemo");
            return await HELPER.execAsync(`cd ${info.projectPath} && git clone https://github.com/aleph-m5/m5-cli-react-native-demo ${demoDirName} && cd ${demoDirName} && rm -rf .git`);
        }

        async updateRoutes(info){
            HELPER.message("RUN updateRoutes");
            const appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
            const appJsonObject = HELPER.jsonToObject(appJsonContent);
            const { nativePlugins } = appJsonObject;
            const importList = HELPER.createImportList(nativePlugins);
            const screenList = HELPER.createsSreenList(nativePlugins);
            let routesDemo = HELPER.getFileContentFromProject(info, `${demoDirName}/routes/index.js`);

            routesDemo = HELPER.findThenUpdateContent({
                regex : /(\/\*(\s)M5(\s)import(\s))([.|\s|\S*])+(\/\*(\s)end(\s)M5(\s)import(\s)\*\/)/gm,
                fileContent: importList,
                originalContent: routesDemo,
                updateType: "replace",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });

            routesDemo = HELPER.findThenUpdateContent({
                regex: /const(\s)screenList(\s)?=(\s)?(\{[^}]+\})/gi,
                fileContent: screenList,
                originalContent: routesDemo,
                updateType: "replace",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });

            return fs.writeFileSync(`${info.projectPath}/${demoDirName}/routes/index.js`, routesDemo, 'utf8');
        }

        async updateRootIndex(info){
            HELPER.message("RUN updateRootIndex");
            let indexRootContent = HELPER.getFileContentFromProject(info, "index.js");
            indexRootContent = indexRootContent.replace(/import(\s)(App)(\s)from(\s)("|')(.){1,20}('|");/gi, `import App from "./M5Demo/App";`)
            return fs.writeFileSync(`${info.projectPath}/index.js`, indexRootContent, 'utf8');
        }

        async updateNavList(info){
            HELPER.message("RUN updateNavList");
            const appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
            const appJsonObject = HELPER.jsonToObject(appJsonContent);
            const { nativePlugins } = appJsonObject;
            const navList = HELPER.createNavigationList(nativePlugins);
            let landingDemoContent = HELPER.getFileContentFromProject(info, `${demoDirName}/containers/Landing/index.js`);

            landingDemoContent = HELPER.findThenUpdateContent({
                regex : /const(\s)?navigationList(\s)?=(\s)?(\[[^\]]+\])/gi,
                fileContent: navList,
                originalContent: landingDemoContent,
                updateType: "replace",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });

            return fs.writeFileSync(`${info.projectPath}/${demoDirName}/containers/Landing/index.js`, landingDemoContent, 'utf8');
        }

        async addReactNavigation(info){
            const { packageJson } = info;
            HELPER.message("RUN addReactNavigation");
            if( packageJson && packageJson.dependencies && !packageJson.dependencies["react-navigation"]){
                return await HELPER.execAsync(`cd ${info.projectPath} && yarn add react-navigation`);
            }else{
                return 1
            }
        }

        async addReactNativeGestureHandler(info){
            const { packageJson } = info;
            HELPER.message("RUN addReactNavigation");
            if( packageJson && packageJson.dependencies && !packageJson.dependencies["react-native-gesture-handler"]){
                const cmd = {
                    task: 'add',
                    name: 'react-native-gesture-handler',
                    version: null,
                    key: null
                }
                return await require('./AddPlugins')({ ...cmd, ...CONFIG })
            }else{
                return 1
            }
        }

        async addMessage(info){
            HELPER.message(`SUCCESS SETUP DEMO\nto run type\nyarn android\nor\nyarn ios`, "success");
        }

        async runCmd(){
            const { info } = this;
            this.run["updateInfo"] = await this.updateInfo(info);
            this.run["createDemoDir"] = await this.createDemoDir(info);
            this.run["addReactNavigation"] = await this.addReactNavigation(info);
            this.run["addReactNativeGestureHandler"] = await this.addReactNativeGestureHandler(info);
            this.run["updateRootIndex"] = await this.updateRootIndex(info);
            this.run["updateRoutes"] = await this.updateRoutes(info);
            this.run["updateNavList"] = await this.updateNavList(info);
            this.run["addMessage"] = await this.addMessage(info);
        }

        init(){
            this.runCmd()
        }
    }

    const runDemo = new Demo({
        cmd : cmd,
        dir : HELPER.getDir()
    });
    runDemo.init();

}
