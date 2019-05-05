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
            return await HELPER.execAsync(`cd ${info.projectPath} && git clone ${CONFIG.repo.reactNativeDemo} ${demoDirName} && cd ${demoDirName} && rm -rf .git && rm .gitignore`);
        }

        async updateRoutes(info){
            HELPER.message("RUN updateRoutes");
            const appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
            const appJson = HELPER.jsonToObject(appJsonContent);
            const { nativePlugins, fonts } = appJson;
            const importList = HELPER.createImportList(nativePlugins, fonts);
            const screenList = HELPER.createsSreenList(nativePlugins, fonts);
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
            indexRootContent = indexRootContent.replace(/import(\s)(App)(\s)from(\s)("|')(.){1,20}('|");/gi, `import App from "./${demoDirName}/App";`)
            return fs.writeFileSync(`${info.projectPath}/index.js`, indexRootContent, 'utf8');
        }

        async updateNavList(info){
            HELPER.message("RUN updateNavList");
            const appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
            const appJson = HELPER.jsonToObject(appJsonContent);
            const { nativePlugins, fonts } = appJson;
            const navList = HELPER.createNavigationList(nativePlugins, fonts);
            let landingDemoContent = HELPER.getFileContentFromProject(info, `${demoDirName}/containers/Landing/index.js`);

            landingDemoContent = HELPER.findThenUpdateContent({
                regex : /const(\s)?navigationList(\s)?=(\s)?((\[[^\]]+\])|\[\])/gi,
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
            HELPER.message("RUN addReactNativeGestureHandler");
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

        async createFontContainer(info, fontName, value){
            const containerName = `Font${fontName}`;
            const fontFamilyList = HELPER.createFontFamilyList(fontName, value);
            const propsLists = HELPER.createPropsLists(fontName, value);
            const textLists = HELPER.createTextLists(fontName, value);
            const contentIndex = fontTemplate(fontFamilyList, propsLists, textLists);

            const containerIsExists = fs.existsSync(`${info.projectPath}/${demoDirName}/containers/${containerName}`)
            const indexIsExists = fs.existsSync(`${info.projectPath}/${demoDirName}/containers/${containerName}/index.js`)

            if(!containerIsExists){
                await HELPER.execAsync(`cd ${info.projectPath}/${demoDirName}/containers/ && mkdir ${containerName}`)
            }

            if(!indexIsExists){
                await HELPER.execAsync(`cd ${info.projectPath}/${demoDirName}/containers/${containerName} && touch index.js`)
            }

            return fs.writeFileSync(`${info.projectPath}/${demoDirName}/containers/${containerName}/index.js`, contentIndex, 'utf8');
        }

        async addFontsDemo(info){
            const appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
            const appJson = HELPER.jsonToObject(appJsonContent);
            const { fonts } = appJson;
            for( let f in fonts){
                await this.createFontContainer(info, f, fonts[f]);
            }
            return 1
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
            this.run["addFontsDemo"] = await this.addFontsDemo(info);
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

const fontTemplate = (fontFamilyList, propsLists, textLists) => {
const data = `
/**
 * This is file generated
 * author : indaam<http://github.com/indaam>
 */

import React, { Component } from "react";
import { View, Text as T } from 'react-native';
import BaseContainer from '../BaseContainer';
import MainTemplate from '../../templates/MainTemplate';
import { COLORS } from "../../config";

const fontFamily = {
${fontFamilyList}
}

const getStyles = (props) => {
    let fontWeight = "Regular";
${propsLists}
    return {
        fontFamily: fontFamily[fontWeight]
    }
}

const textComp = (props) => {
    const { children, style } = props;
    return <T {...props} style={[{ ...getStyles(props) }, style ? style : {}]}>{children}</T>
}

const Text = React.memo(textComp);

export default class FontOpenSans extends BaseContainer {
    render() {
        return (
            <MainTemplate padding>
                <View>
                ${textLists}
                </View>
            </MainTemplate>
        );
    }
}
`;
return data
}
