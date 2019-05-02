const HELPER = require('../utils/helper');

module.exports = class BaseClass {
    constructor(){
        this.run = {}
    }

    getPackageJson(info){
        let packageJsonContent = HELPER.getFileContentFromProject(info, "package.json");
        let packageJsonObject = HELPER.jsonToObject(packageJsonContent);
        return packageJsonObject
    }

    getAppjson(info){
        let appJsonContent = HELPER.getFileContentFromProject(info, "app.json");
        let appJsonObject = HELPER.jsonToObject(appJsonContent);
        return appJsonObject
    }

    async setPackageInfo(info) {
        this.info["appJson"] = this.getAppjson(info);
        this.info["packageJson"] = this.getPackageJson(info);
        if (this.info["appJson"] && this.info["packageJson"]){
            return 1
        }
    }

    async timeout (timeout = 3000){
        HELPER.message("RUN timeout");
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                resolve(1)
            }, timeout)
        })
    }

    async updateInfo(info){
        const { cmd } = info;
        this.info["projectPath"] = info.dir.current;
        this.run["setPackageInfo"] = await this.setPackageInfo(this.info);
        if( cmd && cmd.task && cmd.task =="add"){
            this.info["pluginName"] = HELPER.getPluginInfo("name", cmd);
            this.info["pluginVersion"] = HELPER.getPluginInfo("version", cmd);
            this.info["pluginKey"] = HELPER.getPluginInfo("key", cmd);
        }
    }
}
