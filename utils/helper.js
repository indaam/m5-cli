const fs = require('fs');
const sh = require("shelljs");
const HELPER = {};


HELPER.getVersionName = (name) => {
    if( /@/.test(name) ){
        const data = name.split("@");
        return {
            name: data[0],
            version: data[1]
        }        
    }
    return {
        name: name,
        version: null
    }
}

function paramsToObject(entries) {
    let result = {}
    for (let entry of entries) { // each 'entry' is a [key, value] tupple
        const [key, value] = entry;
        result[key] = value;
    }
    return result;
}

HELPER.createImportList = (data) => {
    const importList = [];
    for( let d in data){
        const componentName = HELPER.createComponentName(d);
        const importName = `import ${componentName} from "./${componentName}";`;
        importList.push(importName)
    }
    return importList.join("\n");
}

HELPER.createsSreenList = (data) => {
    console.log(data);
    const screenList = [];
    for( let d in data){
        const componentName = HELPER.createComponentName(d);
        screenList.push("\t" + componentName)
    }
    return screenList.join(",\n");
}

HELPER.stringToAbject = (str) => {
    // iTodo, need to update
    const obj = {};
    if( str){
        if (str.indexOf("=") > -1) {
            const setArray = str.split("=");
            obj[setArray[0]] = setArray[1];
        } else {
            obj[str] = str
        }
        return obj
    }
    return obj
}

HELPER.createNavigationList = () => {

}

HELPER.findThenUpdateContent = (data) => {
    return data.content.replace(data.regex, function (res) {
        if (data.updateType == "before"){
            return data.updateContent + "\n" + res + "\n"
        }
        return res + "\n" + data.updateContent + "\n"
    })
}

HELPER.setOptions = (options) => {
    if( options[1] == "comp"){
        return {
            task : options[0],
            type : options[1],
            compType : options[2],
            name : options[3]
        }        
    } else if (options[0] == "create" ){
        return {
            task: options[0],
            type: options[1],
            name: options[2],
        }
    } else if (options[0] == "run"){
        return {
            task: options[0],
            name: options[1],
        }
    
    } else if (options[0] == "add"){
        const versionName = HELPER.getVersionName(options[1]);
        const otherValue = HELPER.stringToAbject(options[2]); 
        return {
            task: options[0],
            name: versionName.name,
            version: versionName.version,
            ...otherValue
        } 
    }else{
        const versionName = HELPER.getVersionName(options[1])
        return {
            task : options[0],
            type : versionName.name,
            name : HELPER.validateName(options[2]),
            version : versionName.version
        }        
    }

}

HELPER.getFileContent = (path) =>{
    return fs.readFileSync(path, 'utf8');
}

HELPER.getFileContentFromProject = (data, filePath) => {
    return HELPER.getFileContent(`${data.projectPath}/${filePath}`)
}

HELPER.getFileContentFromM5 = (data, filePath) => {
    console.log("data");
    console.log(data.dir);
    return HELPER.getFileContent(`${data.dir.m5}/${filePath}`)
}

HELPER.getPluginInfo = (type, cmd) => {
    if (cmd[type]){
        return cmd[type]
    }
    return null
}

HELPER.jsonToObject = (data) => {
    try{
        JSON.parse(data)
    }catch (e){
        throw e
    }
    return JSON.parse(data)
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
HELPER.validateFilePath = (data, filePath) => {
    if( /__APP_NAME__/.test(filePath)){
        return filePath.replace(/__APP_NAME__/, data.appJson.name);
    }
    return filePath
}

HELPER.getCompTargetDir = (compDir, cmd) => {
    const type = HELPER.getCompType(cmd.compType)
    if( type == "container"){
        return `${compDir}/${cmd.name}`
    }
    return `${compDir}/${type}/${cmd.name}`

}

HELPER.toCapital = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

HELPER.toArr = (str, splitBy) => {
    return str.split(splitBy);
}

HELPER.createComponentName= (name) => {
    const nameArr = HELPER.toArr(name, "-");
    let nameCapital = [];
    for (let index = 0; index < nameArr.length; index++) {
        nameCapital.push(HELPER.toCapital(nameArr[index]))
    }
    return nameCapital.join("")
}

HELPER.getPluginVersion = (data) => {
    return data.pluginVersion ? data.pluginVersion : data["version"][data.pluginName]
}

HELPER.message = (msg) => {
    console.log("=========================");
    console.log(msg);
    console.log("=========================");
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
