const fs = require('fs');
const sh = require("shelljs");
const HELPER = require('../utils/helper');
const BaseClass = require('./BaseClass');

module.exports = async (cmd) => {

    class Demo extends BaseClass {

        constructor(params){
            super()
            this.info = {...params}
        }

        async createDemoDir(info){
            HELPER.message("RUN createDemoDir");
            const exist = fs.existsSync(info.projectPath + "/" + "M5Demo");
            if( !exist){
                return await this.cloneDemo(info);
            }
            return
        }

        async cloneDemo(info){
            HELPER.message("RUN cloneDemo");
            return await HELPER.execAsync(`cp -Rv ${info.dir.m5}/files/Demo/. ${info.projectPath}/M5Demo/`);
        }

        async updateRoutes(info){
            HELPER.message("RUN updateRoutes");
            const { nativePlugins } = info.appJson;
            const importList = HELPER.createImportList(nativePlugins);
            const screenList = HELPER.createsSreenList(nativePlugins);
            let routesDemo = HELPER.getFileContentFromProject(info, "M5Demo/routes/index.js");

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

            return fs.writeFileSync(`${info.projectPath}/M5Demo/routes/index.js`, routesDemo, 'utf8');
        }

        async updateRootIndex(info){
            HELPER.message("RUN updateRootIndex");
            let indexRootContent = HELPER.getFileContentFromProject(info, "index.js");
            indexRootContent = indexRootContent.replace(/import(\s)(App)(\s)from(\s)("|')(.){1,20}('|");/gi, `import App from "./M5Demo/App";`)
            return fs.writeFileSync(`${info.projectPath}/index.js`, indexRootContent, 'utf8');
        }

        async updateNavList(info){
            HELPER.message("RUN updateNavList");
            const navList = HELPER.createObjectList(info.appJson);
            let landingDemoContent = HELPER.getFileContentFromProject(info, "M5Demo/containers/Landing/index.js");

            landingDemoContent = HELPER.findThenUpdateContent({
                regex : /const(\s)?navigationList(\s)?=(\s)?(\[[^\]]+\])/gi,
                fileContent: navList,
                originalContent: landingDemoContent,
                updateType: "replace",
                commentDisplay: false,
                commentType: null,
                commentMsg: null,
            });

            return fs.writeFileSync(`${info.projectPath}/M5Demo/containers/Landing/index.js`, landingDemoContent, 'utf8');
        }

        async addReactNavigation(info){
            const { packageJson } = info;
            HELPER.message("RUN addReactNavigation");
            if( packageJson && packageJson.dependencies && !packageJson.dependencies["react-navigation"]){
                await HELPER.execAsync(`cd ${info.projectPath} && yarn add react-navigation`);
            }
        }

        async addReactNativeGestureHandler(info){
            const { packageJson } = info;
            HELPER.message("RUN addReactNavigation");
            if( packageJson && packageJson.dependencies && !packageJson.dependencies["react-native-gesture-handler"]){
                HELPER.message(`Error!\ninstall react-native-gesture-handler first,\ntype m5 add react-native-gesture-handler`, 'error')
                // await HELPER.execAsync(`m5 add react-native-gesture-handler`);
            }
        }

        async addMessage(info){
            HELPER.message(`!NOTE\nfor run on iOs, you nedd to cd ios then pod install or yarn pod`, "warning");
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
