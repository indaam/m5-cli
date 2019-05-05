const fs = require('fs');
const sh = require("shelljs");
const HELPER = require('../utils/helper');
const BaseClass = require('./BaseClass');
const CONFIG = require('../config');


const { promisify } = require('util');
const { resolve } = require('path');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

module.exports = async (cmd) => {

    class Fonts extends BaseClass {

        constructor(params){
            super()
            this.info = {...params}
        }

        async isFontsError(info, fontInfo){
            const { downloadName } = fontInfo;
            const fontContent = HELPER.getFileContentFromProject(info, `/assets/fonts/${downloadName}`);
            return /Error|error/.test(fontContent);
        }

        async unzip(info, fontInfo){
            const { name } = fontInfo;
            return await HELPER.execAsync(`cd ${info.projectPath}/assets/fonts/ && unzip -a download?family=${encodeURIComponent(name)}`);
        }

        async clean(info, fontInfo){
            const { path } = fontInfo;
            const fontList = HELPER.getFileByExtentions(`${path}`, '.ttf', false);
            const notFontList = HELPER.getFileByExtentions(`${path}`, '.ttf', true);
            for( let d of notFontList){
                await HELPER.execAsync(`rm ${path}/${d}`)
            }
            return 1
        }

        async download(info, fontInfo){
            const { name } = fontInfo;

            const download = await HELPER.execAsync(`cd ${info.projectPath}/assets/fonts && curl -O https://fonts.google.com/download?family=${encodeURIComponent(name)}`);
            const isFontsError = await this.isFontsError(info, fontInfo);

            if( isFontsError ){
                HELPER.message(`Error, your font ${name}\nNot avaliable on https://fonts.google.com/download?family=${encodeURIComponent(name)}`, 'error')
                console.log("NEXT")
            }

            if( download){
                return 1
            }
        }

        async setRnpm(info, fontInfo){
            const packageJsonContent = HELPER.getFileContentFromProject(info, "package.json");
            const packageJson = HELPER.jsonToObject(packageJsonContent);

            packageJson["rnpm"] = {};
            packageJson["rnpm"]["assets"] = ["./assets/fonts/"];

            return fs.writeFileSync(`${info.projectPath}/package.json`, JSON.stringify(packageJson, null, 2), 'utf8');
        }

        async reLink(info, fontInfo){
            await HELPER.execAsync(`cd ${info.projectPath} && react-native link`)
        }

        async defineOnAppJson(info, fontInfo){
            const { fontFamily, path } = fontInfo;
            const fontList = HELPER.getFontListByName(path, fontFamily);
            const appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
            const appJson = HELPER.jsonToObject(appJsonContent);

            if (appJson["fonts"]){
                appJson["fonts"][fontFamily] = fontList
            }else{
                appJson["fonts"] = {};
                appJson["fonts"][fontFamily] = fontList
            }
            return fs.writeFileSync(`${info.projectPath}/app.json`, JSON.stringify(appJson, null, 2), 'utf8');
        }

        async checkFont(info, fontInfo){
            const { fontFamily, path } = fontInfo;
            const fontList = HELPER.getFontListByName(path, fontFamily); 

            if( fontList && fontList.length){
                HELPER.message("Error!\nFont is exist, try another font", "error");
            }
        }

        async addMessage(info, fontInfo){
            const { fontFamily, path } = fontInfo;
            HELPER.message(`SUCCESS add ${fontFamily}\nTo see the demo type\nm5 demo && react-native run-ios\nor react-native run-android for android`, "success");
        }

        async setupFonts(info){
            const { cmd } = info;
            const fontName = HELPER.getFontName(cmd);
            const fontPath = `${info.projectPath}/assets/fonts`;
            const fontDownloadName = HELPER.getFontDownloadName(fontName);

            const fontInfo = {
                name : fontName,
                downloadName : fontDownloadName,
                fontFamily : HELPER.setFontFamily(fontName),
                path : fontPath
            }

            const isAssetsExisists = fs.existsSync(info.projectPath + "/" + "assets");
            const isFontDirExists = fs.existsSync(info.projectPath + "/" + "assets/fonts");

            if( !isAssetsExisists){
                await HELPER.execAsync(`cd ${info.projectPath} && mkdir assets`)
            }

            if( !isFontDirExists){
                await HELPER.execAsync(`cd ${info.projectPath}/assets && mkdir fonts`)
            }


            await this.checkFont(info, fontInfo);
            await this.download(info, fontInfo);
            await this.unzip(info, fontInfo);
            await this.clean(info, fontInfo);
            await this.setRnpm(info, fontInfo);
            await this.defineOnAppJson(info, fontInfo);
            await this.reLink(info, fontInfo);
            await this.addMessage(info, fontInfo);

        }

        async runCmd(){
            const { info } = this;
            this.run["updateInfo"] = await this.updateInfo(info);
            this.run["setupFonts"] = await this.setupFonts(info);
        }

        init(){
            this.runCmd()
        }
    }

    const runFonts = new Fonts({
        cmd : cmd,
        dir : HELPER.getDir()
    });
    runFonts.init();

}
