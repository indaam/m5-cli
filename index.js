const CONFIG = require('./config');
const HELPER = require('./utils/helper');
const error = require('./utils/error');

const cmd = () => {
    const [, , ...args] = process.argv;
    const cmd = HELPER.setOptions(args);
    console.log(cmd);
    if (cmd.task == "create") {
        switch (cmd.type) {
            case 'html':
                require('./cmds/CreateHtml')({ ...cmd, ...CONFIG })
                break

            case 'comp':
                require('./cmds/CreateComp')({ ...cmd, ...CONFIG })
                break
            
            case 'rn':
            case 'r-n':
            case 'react-native':
                require('./cmds/CreateReactNative')({ ...cmd, ...CONFIG })
                break

            default:
                error(`"${cmd}" is not a valid command!`, true)
                break
        }
    } else if (cmd.task == "demo") {
        require('./cmds/Demo')({ ...cmd, ...CONFIG })
    } else if (cmd.task == "add") {
        require('./cmds/AddPlugins')({ ...cmd, ...CONFIG })
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

module.exports = {
    HELPER : HELPER,
    cmd : cmd
}
