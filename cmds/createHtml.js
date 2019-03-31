const fs = require('fs');
const HELPER = require('../utils/helper');
const error = require('../utils/error');

module.exports = async (cmd) => {

    const DIRECTORY = {
        current: process.cwd()
    }

    class createHtml {

        constructor(options) {
            this.cmd = options;
            this.run = {};
        }

        async cloneRepo(cmd) {
            const projectName = HELPER.validateName(cmd.name, true);
            const projectPath = DIRECTORY.current + "/" + projectName;

            if (!fs.existsSync(projectPath)) {
                return HELPER.execAsync(`git clone https://xituz@bitbucket.org/xituz/html.git ${HELPER.validateName(cmd.name, true)}`)
            } else {
                return "exists"
            }
        }

        async installPackage(cmd) {
            return HELPER.execAsync(`cd ${DIRECTORY.current}/${HELPER.validateName(cmd.name, true)} && yarn install`)
        }


        async updatePackage(cmd) {

            const packageJson = `${DIRECTORY.current}/${HELPER.validateName(cmd.name, true)}/package.json`;
            let contentPackageJson = fs.readFileSync(packageJson, 'utf8');

            let parsePackege = JSON.parse(contentPackageJson);
            parsePackege["name"] = `${HELPER.validateName(cmd.name, true)}`;

            return fs.writeFileSync(packageJson, JSON.stringify(parsePackege, null, 2), 'utf8');
        }


        async runCmd(){
            const { cmd } = this;
            this.run["cloneRepo"] = await this.cloneRepo(cmd);
            if (this.run["cloneRepo"] != "exists"){
                this.run["updatePackage"] = await this.updatePackage(cmd);
                this.run["installPackage"] = await this.installPackage(cmd);
            }else{
                error(`Project ${HELPER.validateName(cmd.name, true)} is exist`, 1);
            }
        }

        init() {
            this.runCmd();
        }
    }

    const html = new createHtml(cmd);
    html.init();

}
