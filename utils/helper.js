const sh = require("shelljs");
const HELPER = {};

HELPER.setOptions = (options) => {
    if( options[1] == "comp"){
        return {
            task : options[0],
            type : options[1],
            compType : options[2],
            name : options[3]
        }        
    }
    return {
        task : options[0],
        type : options[1],
        name : options[2]
    }
}

HELPER.validateName = (name, includeNumber) => {
    if ( name && includeNumber ){
        return name.replace(/\s|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\-|\'|\"|\;|\:|\?|\/|\>|\<|\,|\.|\\|\]|\[|\}|\{|\|/g, '')
    }else if( name ){
        return name.replace(/\s|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\-|\'|\"|\;|\:|\?|\/|\>|\<|\,|\.|\\|\d|\]|\[|\}|\{|\|/g, '')
    }
    return 0
}

HELPER.getSrcDir = (path) => {
    return path.split("/")[0];
}

HELPER.cutPathByString = (path, str) => {
    return str + "" + path.split(str)[1];
}

HELPER.getBaseComponent = (type) => {
    if( type == "atoms"){
        return "BaseFunction.js"
    }
    if( type == "container"){
        return "BaseContainer.js"
    }
    return "BaseClass.js"
}

HELPER.getCompType = (name) => {

    if( name == "molecule"){
        return "molecules"
    }

    if( name == "m"){
        return "molecules"
    }

    if( name == "a"){
        return "atoms"
    }

    if( name == "atom"){
        return "atoms"
    }

    if( name == "container"){
        return "container"
    }
    if( name == "containers"){
        return "container"
    }

    if( name == "c"){
        return "container"
    }

    if( name == "organisms"){
        return "organisms"
    }
    if( name == "organism"){
        return "organisms"
    }

    if( name == "o"){
        return "organisms"
    }
}

HELPER.getCompTargetDir = (compDir, cmd) => {
    const type = HELPER.getCompType(cmd.compType)
    if( type == "container"){
        return `${compDir}/${cmd.name}`
    }
    return `${compDir}/${type}/${cmd.name}`

}

HELPER.getLastArray = (arr) => {
    if (arr && arr.length) {
        return arr[arr.length - 1]
    }
    return arr
}

HELPER.execAsync = (cmd, opts={}) => {
    return new Promise(function(resolve, reject) {
        console.log("====================================== ");
        console.log("============= START EXEC ============= ");
        console.log(cmd);
        console.log("=============  END EXEC  ============= ");
        console.log("====================================== ");
        sh.exec(cmd, opts, function(code, stdout, stderr) {
            resolve({
                code : !code,
                stdout : stdout,
                stderr : stderr
            });
        });
    });
}

HELPER.createDir = (dir) => {
    return sh.mkdir('-p', dir);
}

HELPER.getm5Path = (dir) => {
    const path = dir.split("m5-cli");
    return path[0] + "m5-cli";
}

module.exports = HELPER
