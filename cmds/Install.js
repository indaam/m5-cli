const fs = require('fs');
const sh = require("shelljs");
const HELPER = require('../utils/helper');
const BaseClass = require('./BaseClass');
const CONFIG = require('../config');

const AddPlugins = require('./AddPlugins');

module.exports = async (cmd) => {

    class Install extends BaseClass {

        constructor(params){
            super()
            this.info = {...params}
        }

        addMessage(cmdList){
            let msg = `SUCCESS SETUP ${cmdList.length} PLUGINS`;
            for( let cmd of cmdList){
                msg+= `\n${cmd.name} => ${cmd.version}`
            }
            msg+= `\nTry, m5 demo to see the demo`;
            HELPER.message(msg, 'success');
        }

        async installPlugins(cmdList){
            for( let cmd of cmdList){
                await AddPlugins({...cmd, CONFIG})
            }
            this.addMessage(cmdList)
        }

        async setupPlugins(info){
            const { nativePlugins } = info.appJson;
            if(!nativePlugins){
                HELPER.message("nativePlugins not set, check your app.json", 'error');
            }
            const cmdList = HELPER.createTaskFromObject(nativePlugins);

            if(!cmdList || !cmdList.length){
                HELPER.message("nativePlugins not set, check your app.json", 'error');
            }
            
            if(cmdList){
                await this.installPlugins(cmdList)
            }
        }

        async runCmd(){
            const { info } = this;
            this.run["updateInfo"] = await this.updateInfo(info);
            this.run["setupPlugins"] = await this.setupPlugins(info);
        }

        init(){
            this.runCmd()
        }
    }

    const runInstall = new Install({
        cmd : cmd,
        dir : HELPER.getDir()
    });
    runInstall.init();

}

// iTodo
// NEED CALLBACK when already setup
