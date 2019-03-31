// const minimist = require('minimist')
const CONFIG = require('./config');
const HELPER = require('./utils/helper');
const error = require('./utils/error');

module.exports = () => {
    const [, , ...args] = process.argv;
    const cmd = HELPER.setOptions(args);

    if (cmd.task == "create") {
        switch (cmd.type) {
            case 'html':
                require('./cmds/createHtml')({ ...cmd, ...CONFIG })
                break

            case 'comp':
                require('./cmds/createComp')({ ...cmd, ...CONFIG })
                break

            default:
                error(`"${cmd}" is not a valid command!`, true)
                break
        }
    } else if (/-v|-version|v|version/.test(cmd.task)) {
        require('./cmds/version')(args)
    } else if (/-help|-h|h|help/.test(cmd.task)){
        require('./cmds/help')(args)
    }else if(!args.length){
        require('./cmds/help')(args)
    }else{
        error(`m5 ${args} not valid command!, try m5 -h`, true)
    }
}
