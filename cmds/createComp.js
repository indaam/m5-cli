const fs = require('fs');
const HELPER = require('../utils/helper');

module.exports = async (cmd) => {

    const DIRECTORY = {
        current: process.cwd(),
        m5: HELPER.getm5Path(__dirname),
    }

    class createComp {

        constructor(options) {
            this.cmd = options;
            this.run = {};
        }

        async copyM5Component(cmd){
            return HELPER.execAsync(`cp -Rv ${DIRECTORY.m5}/m5/. ${DIRECTORY.current}/m5`);
        }

        async createM5dir(cmd){
            if (!fs.existsSync("m5")) {
                return HELPER.execAsync(`mkdir m5`);
            }else{
                return "exists"
            }
        }

        async copyM5Config(cmd){
            return HELPER.execAsync(`cp -Rv ${DIRECTORY.m5}/m5.config ${DIRECTORY.current}/m5.config`);
        }

        async createM5Config(cmd){
            if (!fs.existsSync("m5.config")) {
                return this.copyM5Config(cmd)
            }else{
                return "exists"
            }
        }

        async writeComp(cmd, fullPath, srcDir){
            const compName = HELPER.validateName(cmd.name);
            const getBaseComp = HELPER.getBaseComponent(HELPER.getCompType(cmd.compType));
            const getBaseCompFile = `${DIRECTORY.current}/m5/${getBaseComp}`;
            const getBaseCompStyleFile = `${DIRECTORY.current}/m5/BaseStyles.js`;

            let compFile = fs.readFileSync(getBaseCompFile, 'utf8');
            let styleFile = fs.readFileSync(getBaseCompStyleFile, 'utf8');

            compFile = compFile.replace(/__DONT_CHANGE_ME__/gi, function (res) {
                return compName;
            });

            const writeIndexFile = fs.writeFile(fullPath + "/" + "index.js", compFile, (err)=> {
                if (err) throw err;
                console.log(".................... SUCCESS ....................");
                console.log(`Create index ${compName} on ${HELPER.cutPathByString(fullPath, srcDir)}/index.js`)
            });
            const writeStylesFile = fs.writeFile(fullPath + "/" + "styles.js", styleFile, (err) => {
                if (err) throw err;
                console.log(".................... SUCCESS ....................");
                console.log(`Create styles ${compName} on ${HELPER.cutPathByString(fullPath, srcDir)}/styles.js`)
            });

            return {
                writeIndexFile: writeIndexFile,
                writeStylesFile: writeStylesFile
            }

        }

        async createComp(cmd){
            let compTargetPath = "";
            let fixTargetCompDir = "";
            const getConfig = fs.readFileSync(`${DIRECTORY.current}/m5.config`, 'utf8');
            const getConfigAsObject = JSON.parse(getConfig);

            const compType = HELPER.getCompType(cmd.compType);
            const srcDir = HELPER.getSrcDir(getConfigAsObject.path.container);

            if( compType == "container"){
                compTargetPath = `${getConfigAsObject.path.container}`;
            }else{
                compTargetPath = `${getConfigAsObject.path.components}`;
            }

            fixTargetCompDir = HELPER.getCompTargetDir(`${DIRECTORY.current}/${compTargetPath}`, cmd);

            if (fs.existsSync(fixTargetCompDir)) {
                  console.error(`Component ${cmd.name} is exists`);
                  return process.exit(1)
            }else{
                const writCompDir = HELPER.createDir(fixTargetCompDir);
                if( writCompDir ){
                    return this.writeComp(cmd, fixTargetCompDir, srcDir);
                }
            }
        }

        async runCmd(){
            const { cmd } = this;
            this.run["createM5dir"] = await this.createM5dir(cmd);

            if( this.run["createM5dir"] != "exists"){
                this.run["copyM5Component"] = await this.copyM5Component(cmd);
            }

            this.run["createM5Config"] = await this.createM5Config(cmd);
            this.run["createComp"] = await this.createComp(cmd);
        }

        init() {
            this.runCmd();
        }
    }

    const comp = new createComp(cmd);
    comp.init();

}
