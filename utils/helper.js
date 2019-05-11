const fs = require('fs');
const sh = require("shelljs");
const HELPER = {};


HELPER.getVersionName = (name) => {
    if (/@/.test(name)) {
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

HELPER.getFontWeightByFileName = (fontName, str) => {
    return str.replace(`${fontName}-`, "").replace('.ttf', '');
}

HELPER.createFontFamilyList = (fontName, data) => {
    const temp = [];
    for( let d of data){
        const fontWeight = HELPER.getFontWeightByFileName(fontName, d);
        temp.push(`"${fontWeight}" : "${fontName}-${fontWeight}"`);
    }
    return `\t` + temp.join(',\n\t');
}

HELPER.createPropsLists = (fontName, data) => {
    const temp = [];
    for( let d of data){
        const fontWeight = HELPER.getFontWeightByFileName(fontName, d);
        temp.push(`props.${fontWeight} ? fontWeight = '${fontWeight}' : void 0;`);
    }
    return `\t` + temp.join('\n\t');
}

HELPER.createTextLists = (fontName, data) => {
    const temp = [];
    for( let d of data){
        const fontWeight = HELPER.getFontWeightByFileName(fontName, d);
        temp.push(`
            <View style={{marginBottom : 12}}>
                <Text ${fontWeight} style={{ fontSize: 14, color : COLORS.softBlack }}>Hai, I am ${fontName} ${fontWeight}</Text>
                <Text ${fontWeight} style={{ fontSize: 14, color : COLORS.softBlack }}>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
            </View>
        `);
    }
    return temp.join('\n');
}


HELPER.createNavigationList = (nativePlugins, fonts) => {
    const list = [];
    for (let d in nativePlugins) {
        list.push({
            title: HELPER.createComponentTitle(d),
            navigation: HELPER.createComponentName(d),
        })
    }

    if( fonts ){
        for( let f in fonts){
            list.push({
                title: `Font ${f}`,
                navigation: `Font${f}`,
            })
        }
    }

    return `const navigationList = ${JSON.stringify(list, null, 2)}`;

}

HELPER.createImportList = (nativePlugins, fonts) => {
    const open = `/* M5 import */\n`;
    const close = `\n/* end M5 import */`;

    const importList = [];
    for (let d in nativePlugins) {
        const componentName = HELPER.createComponentName(d);
        const importName = `import ${componentName} from "../containers/${componentName}";`;
        importList.push(importName)
    }

    if( fonts ){
        for (let d in fonts) {
            const importName = `import Font${d} from "../containers/Font${d}";`;
            importList.push(importName)
        }
    }


    return open + importList.join("\n") + close;
}

HELPER.createsSreenList = (nativePlugins, fonts) => {
    const screenList = {
        "LandingScreen": "LandingScreen"
    };

    for (let d in nativePlugins) {
        const componentName = HELPER.createComponentName(d);
        screenList[componentName] = componentName;
    }

    if( fonts ){
        for (let d in fonts) {
            screenList[`Font${d}`] = `Font${d}`;
        }
    }

    return `const screenList = ` + JSON.stringify(screenList, null, 4).replace(/"|'/g, "");
}

HELPER.stringToAbject = (str) => {
    // iTodo, need to update
    const obj = {};
    if (str) {
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


HELPER.commentOpen = (type) => {
    if (type == 'plist') {
        type = 'xml';
    }
    if (type == "properties" || type == "Podfile") {
        return `#`
    }
    if (type == "xml") {
        return `<!--`
    }
    return `/*`
}

HELPER.getPackageValue = (data) => {
    if (typeof data == "string") {
        return {
            version: data,
            key: null
        }
    }
    return {
        version: data["version"],
        key: data["key"]
    }
}

HELPER.createTaskFromObject = (data) => {

    const cmd = {
        task: 'add',
        name: 'react-native-gesture-handler',
        version: null,
        key: null
    }

    const temp = [];
    for (let k in data) {
        const packageValue = HELPER.getPackageValue(data[k]);
        temp.push({
            task: 'add',
            name: k,
            version: packageValue["version"],
            key: packageValue["key"]
        })
    }

    return temp


}

HELPER.commentClose = (type) => {
    if (type == 'plist') {
        type = 'xml';
    }
    if (type == "properties" || type == "Podfile") {
        return `#`
    }
    if (type == "xml") {
        return `-->`
    }
    return `*/`
}

HELPER.commentStart = (data) => {
    if (data.print) {
        return `${HELPER.commentOpen(data.type)} M5 START ${data.msg} ${HELPER.commentClose(data.type)}\n`
    }
    return ""
}

HELPER.commentEnd = (data) => {
    if (data.print) {
        return `\n${HELPER.commentOpen(data.type)} M5 END ${data.msg} ${HELPER.commentClose(data.type)}`
    }
    return ""
}


HELPER.findThenUpdateContent = (data) => {
    const commentStart = HELPER.commentStart({
        print: data.commentDisplay,
        msg: data.commentMsg,
        type: data.commentType
    })

    const commentEnd = HELPER.commentEnd({
        print: data.commentDisplay,
        msg: data.commentMsg,
        type: data.commentType
    });

    const fileContent = commentStart + data.fileContent + commentEnd;

    if (data.updateType == "firstline") {
        return fileContent + "\n" + data.originalContent
    }

    if (data.updateType == "lastline") {
        return data.originalContent + "\n" + fileContent
    }

    return data.originalContent.replace(data.regex, function (res) {
        if (data.updateType == "before") {
            return "\n" + fileContent + "\n" + res
        } else if (data.updateType == "after") {
            return res + "\n" + fileContent
        } else {// replace
            return fileContent
        }
    })
}

HELPER.generateUsesPermissions = (data) => {
    const temp = [];
    for (const d of data) {
        temp.push(`\t<uses-permission android:name="android.permission.${d}" />`)
    }
    return temp.join("\n");
}

HELPER.getPermissionsList = (data) => {
    const re = /\<uses-permission(\s)android:name="(.+)"(\s)?\/\>/g;
    const reContent = /android:name="(.+)"/g;
    const reRemove = /android\:name\=\"android\.permission\./g;

    let permissionsList = HELPER.uniqueArray(data.match(re));

    const temp = [];
    for (let uses of permissionsList) {
        uses = (uses.match(reContent)[0]).replace(reRemove, "").replace('"', '');
        temp.push(uses)
    }

    return temp

}

HELPER.uniqueArray = (arr) => {
    if (!arr && !arr.length) {
        return []
    }
    var a = [];
    for (var i = 0, l = arr.length; i < l; i++)
        if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
            a.push(arr[i]);
    return a;
}


HELPER.message = (msg, type = "default", calback) => {
    function cb() {
        if (typeof calback == "function") {
            calback()
        }
    }
    if (type == "error") {
        console.log('\x1b[31m')
        console.log(`/***********************/`)
        console.log(msg)
        cb()
        console.log(`/***********************/`)
        console.log('\x1b[0m');
        process.exit(1);
    }
    if (type == "warning") {
        console.log('\x1b[33m')
        console.log(`/***********************/`)
        console.log(msg)
        cb()
        console.log('\x1b[33m')
        console.log(`/***********************/`)
        console.log('\x1b[0m');
    }
    if (type == "success") {
        console.log('\x1b[32m')
        console.log(`/***********************/`)
        console.log(msg)
        cb()
        console.log('\x1b[32m')
        console.log(`/***********************/`)
        console.log('\x1b[0m');
    }
    if (type == "default") {
        console.log(msg)
        cb()
    }
}

HELPER.getExtention = (filePath) => {
    if (/\./.test(filePath)) {
        return HELPER.getLastArray(filePath.split("."));
    } else {
        return HELPER.getLastArray(filePath.split("/"));
    }
}

HELPER.setOptions = (options) => {
    if (options[1] == "comp") {
        return {
            task: options[0],
            type: options[1],
            compType: options[2],
            name: options[3]
        }
    } else if (options[0] == "create" || options[0] == "c") {
        return {
            task: "create",
            type: options[1],
            name: options[2],
        }
    } else if (options[0] == "run") {
        return {
            task: options[0],
            name: options[1],
        }

    } else if (options[0] == "add") {
        const versionName = HELPER.getVersionName(options[1]);
        const otherValue = HELPER.stringToAbject(options[2]);
        return {
            task: options[0],
            name: versionName.name,
            version: versionName.version,
            ...otherValue
        }
    } else if (options[0] == "fonts") {
        return {
            task: options[0],
            name: options[1],
            all: options.join(" ")
        }
    } else {
        const versionName = HELPER.getVersionName(options[1])
        return {
            task: options[0],
            type: versionName.name,
            name: HELPER.validateName(options[2]),
            version: versionName.version
        }
    }

}

HELPER.getFontName = (cmd) => {
    const { all } = cmd;
    return (all.split("fonts ")[1])
    .replace(/\+/g, " ")
    .split(" ")
    .map(d => {
        return HELPER.toCapital(d)
    }).join(" ");
}

HELPER.getFontDownloadName = (fontName) => {
    return `download?family=${encodeURIComponent(fontName)}`
}

HELPER.getFileByExtentions = (dir, ext, change) => {
    const re = new RegExp(ext);
    const lists = fs.readdirSync(dir);
    const temp = [];
    for (let d of lists) {
        if(change && !re.test(d)){
            temp.push(d)
        }
        if(!change && re.test(d)){
            temp.push(d)
        }
    }
    return temp
}

HELPER.getFontListByName = (dir, fontFamily) => {
    const re = new RegExp(fontFamily);
    const lists = fs.readdirSync(dir);
    const temp = [];
    for (let d of lists) {
        if(re.test(d)){
            temp.push(d)
        }
    }
    return temp
}

HELPER.getFileContent = (path) => {
    return fs.readFileSync(path, 'utf8');
}

HELPER.getFileContentFromProject = (data, filePath) => {
    return HELPER.getFileContent(`${data.projectPath}/${filePath}`)
}

HELPER.getFileContentFromM5 = (data, filePath) => {
    return HELPER.getFileContent(`${data.dir.m5}/${filePath}`)
}

HELPER.getPluginInfo = (type, cmd) => {
    if (cmd[type]) {
        return cmd[type]
    }
    return null
}

HELPER.setFontFamily = (str) => {
    return str.replace(/\s/g, "");
}

HELPER.jsonToObject = (data) => {
    try {
        JSON.parse(data)
    } catch (e) {
        throw e
    }
    return JSON.parse(data)
}

HELPER.validateName = (name, includeNumber) => {
    if (name && includeNumber) {
        return name.replace(/\s|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\-|\'|\"|\;|\:|\?|\/|\>|\<|\,|\.|\\|\]|\[|\}|\{|\|/g, '')
    } else if (name) {
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
    if (type == "atoms") {
        return "BaseFunction.js"
    }
    if (type == "container") {
        return "BaseContainer.js"
    }
    return "BaseClass.js"
}

HELPER.getCompType = (name) => {

    if (name == "molecule") {
        return "molecules"
    }

    if (name == "m") {
        return "molecules"
    }

    if (name == "a") {
        return "atoms"
    }

    if (name == "atom") {
        return "atoms"
    }

    if (name == "container") {
        return "container"
    }
    if (name == "containers") {
        return "container"
    }

    if (name == "c") {
        return "container"
    }

    if (name == "organisms") {
        return "organisms"
    }
    if (name == "organism") {
        return "organisms"
    }

    if (name == "o") {
        return "organisms"
    }
}
HELPER.validateFilePath = (data, filePath) => {
    if (/__APP_NAME__/.test(filePath)) {
        return filePath.replace(/__APP_NAME__/, data.appJson.name);
    }
    return filePath
}

HELPER.getCompTargetDir = (compDir, cmd) => {
    const type = HELPER.getCompType(cmd.compType)
    if (type == "container") {
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

HELPER.createComponentName = (name) => {
    const nameArr = HELPER.toArr(name, "-");
    let nameCapital = [];
    for (let index = 0; index < nameArr.length; index++) {
        nameCapital.push(HELPER.toCapital(nameArr[index]))
    }
    return nameCapital.join("")
}

HELPER.createComponentTitle = (name) => {
    const nameArr = HELPER.toArr(name, "-");
    let nameCapital = [];
    for (let index = 0; index < nameArr.length; index++) {
        nameCapital.push(HELPER.toCapital(nameArr[index]))
    }
    return nameCapital.join(" ")
}

HELPER.getPluginVersion = (data) => {
    return data.pluginVersion ? data.pluginVersion : data["version"][data.pluginName]
}

HELPER.getDir = () => {
    return {
        current: process.cwd(),
        m5: HELPER.getm5Path(__dirname)
    }
}

HELPER.getPluginsName = (data) => {
    const version = HELPER.getPluginVersion(data);
    if (data.pluginKey) {
        return {
            "version": version,
            "key": data.pluginKey
        }
    }
    return version
}

HELPER.getLastArray = (arr) => {
    if (arr && arr.length) {
        return arr[arr.length - 1]
    }
    return arr
}

HELPER.execAsync = (cmd, opts = {}) => {
    return new Promise(function (resolve, reject) {
        console.log("====================================== ");
        console.log("============= START EXEC ============= ");
        console.log(cmd);
        console.log("=============  END EXEC  ============= ");
        console.log("====================================== ");
        sh.exec(cmd, opts, function (code, stdout, stderr) {
            resolve({
                code: !code,
                stdout: stdout,
                stderr: stderr
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
